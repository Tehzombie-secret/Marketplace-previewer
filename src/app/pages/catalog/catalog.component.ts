import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, NgForOf, NgIf, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, filter, map, Observable, of, shareReplay, startWith, Subscription, switchMap, tap } from 'rxjs';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { filterTruthy } from '../../helpers/observables/filter-truthy';
import { treeFind } from '../../helpers/tree-find';
import { truthy } from '../../helpers/truthy';
import { Categories } from '../../models/categories/categories.interface';
import { Category } from '../../models/categories/category.interface';
import { Product } from '../../models/product/product.interface';
import { APIService } from '../../services/api/api.service';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { ToolbarService } from '../../services/toolbar/toolbar.service';
import { SEARCH_QUERY_PARAM } from './constants/search-query-param.const';
import { CatalogViewModel } from './models/catalog-view-model.interface';

const PAGE_CAP_STRATEGY: Record<APIPlatform, number> = {
  [APIPlatform.WB]: 50,
  [APIPlatform.ETSY]: 5,
};

@Component({
  standalone: true,
  selector: 'wb-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgForOf,
    AsyncPipe,
    SlicePipe,
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    ProductCardComponent,
  ],
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('200ms ease-out', style({ opacity: 0, transform: 'scale(1.05)' })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('220ms ease-in', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class CatalogComponent implements OnInit, OnDestroy {

  readonly title$ = this.getNameChanges();
  readonly page$ = new BehaviorSubject<number>(1);
  private readonly retry$ = new BehaviorSubject<void>(void 0);
  readonly items$ = new BehaviorSubject<CatalogViewModel>({ isLoading: false, items: [], hasError: false });
  readonly itemsToShow$ = new BehaviorSubject<number>(0);
  readonly visibleItems$ = this.getVisibleItemsChanges(this.items$, this.itemsToShow$);
  readonly canShowMore$ = this.canShowMoreChanges(this.itemsToShow$, this.items$, this.page$);
  readonly menuPath$ = this.getMenuPathChanges();
  private readonly itemsPerPage = 14;
  private readonly subscription$ = new Subscription();

  constructor(
    private API: APIService,
    private route: ActivatedRoute,
    private title: Title,
    private toolbar: ToolbarService,
  ) {
  }

  ngOnInit(): void {
    this.listenTitleChanges();
    this.listenPageChanges();
    this.listenCatalogChanges();
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }

  trackByProduct(_index: number, item: Partial<Product>): string | number | null {
    return item.id ?? null;
  }

  retry(): void {
    this.retry$.next();
  }

  nextPage(): void {
    this.itemsToShow$.next(this.itemsToShow$.value + this.itemsPerPage);
  }

  private listenTitleChanges(): void {
    const titleSubscription$ = this.title$.subscribe((title: string) => {
      this.title.setTitle(title);
      this.toolbar.setTitle(title);
    });
    this.subscription$.add(titleSubscription$);
  }

  private getNameChanges(): Observable<string> {
    return this.route.queryParamMap
      .pipe(
        map((paramMap: ParamMap) => paramMap.get(SEARCH_QUERY_PARAM)),
        switchMap((query: string | null) => query
          ? of('Поиск')
          : combineLatest([
            this.API.getCategoriesChanges(),
            this.route.paramMap
              .pipe(
                map((paramMap: ParamMap) => paramMap.get('id')),
                filterTruthy(),
              ),
          ])
            .pipe(
              map(([categories, id]: [Categories, string]) =>
                treeFind(categories.items, (item: Category) => item.children, (item: Category) => `${item.slug}` === id)
              ),
              map((category: Category | null) => category?.title ?? 'Каталог'),
            )
        ),
      );
  }

  private listenCatalogChanges(): void {
    const pingSubscription$ = this.retry$
      .pipe(
        switchMap(() => combineLatest([
          this.route.paramMap.pipe(map((paramMap: ParamMap) => paramMap.get('id'))),
          this.route.queryParamMap.pipe(map((paramMap: ParamMap) => paramMap.get(SEARCH_QUERY_PARAM))),
          this.getMaxPageChanges(),
        ])),
        filter(([id, query, maxPage]: [string | null, string | null, number]) => Boolean(id || query))
      )
      .subscribe(([id, query, maxPage]: [string | null, string | null, number]) => {
        this.itemsToShow$.next(this.itemsPerPage);
        this.fetch(maxPage, 1);
      });
    this.subscription$.add(pingSubscription$);
  }

  private getMenuPathChanges(): Observable<string[]> {
    return this.route.paramMap
      .pipe(
        map((paramMap: ParamMap) => [`/${paramMap.get('platform')}`]),
      );
  }

  private fetch(maxPage: number, page: number): void {
    if (this.items$.value.isLoading) {
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    const query = this.route.snapshot.queryParamMap.get(SEARCH_QUERY_PARAM);
    const loading: CatalogViewModel = { ...this.items$.value, isLoading: true, hasError: false };
    this.items$.next(loading);
    this.page$.next(page);
    const pages$ = new Array(Math.min(maxPage, page)).fill(0).map((_, index: number) => {
      return (id || query)
        ? (id ? this.API.getCatalogChanges(id, index + 1) : this.API.getSearchChanges(query, index + 1))
        : of(null)
    });
    const fetchSubscription$ = combineLatest(pages$)
      .pipe(
        map((items: (Partial<Product>[] | null)[]) => items.flat().filter(truthy)),
      )
      .subscribe({
        next: (catalog: Partial<Product>[]) => this.items$.next({
          items: catalog,
          isLoading: false,
          hasError: false,
        }),
        error: () => this.items$.next({
          ...this.items$.value,
          isLoading: false,
          hasError: true,
        }),
      });
    this.subscription$.add(fetchSubscription$);
  }

  private canShowMoreChanges(
    visibleItems$: Observable<number>,
    items$: Observable<CatalogViewModel>,
    page$: Observable<number>,
  ): Observable<boolean> {
    return combineLatest([
      this.getMaxPageChanges(),
      visibleItems$,
      items$,
      page$,
    ])
      .pipe(
        map(([maxPage, visibleItems, items, page]: [number, number, CatalogViewModel, number]) =>
          !(maxPage >= page && visibleItems >= items.items.length)
        ),
      );
  }

  private listenPageChanges(): void {
    const pageSubscription$ = combineLatest([
      this.itemsToShow$.pipe(tap((s) => console.log('items to show change', s))),
      this.items$,
      this.page$.pipe(tap((s) => console.log('page change', s))),
      this.getMaxPageChanges().pipe(tap((s) => console.log('max page change', s))),
    ])
      .pipe(
        filter(([visibleItems, items, page, maxPage]: [number, CatalogViewModel, number, number]) =>
          visibleItems >= items.items.length - this.itemsPerPage * 2
          && items.items.length > 0
          && !items.isLoading
          && !items.hasError
          && page < maxPage
        ),
      )
      .subscribe(([visibleItems, items, page, maxPage]) => {
        this.fetch(maxPage, page + 1);
      });
    this.subscription$.add(pageSubscription$);
  }

  private getMaxPageChanges(): Observable<number> {
    return this.route.paramMap
      .pipe(
        map((paramMap: ParamMap) => paramMap.get('platform') as (APIPlatform | null)),
        map((platform: APIPlatform | null) => PAGE_CAP_STRATEGY[platform ?? APIPlatform.WB]),
      );
  }

  private getVisibleItemsChanges(items$: Observable<CatalogViewModel>, itemsToShow$: Observable<number>): Observable<CatalogViewModel> {
    return combineLatest([
      items$,
      itemsToShow$,
    ])
      .pipe(
        map(([items, itemsToShow]: [CatalogViewModel, number]) => ({
          ...items,
          items: items.items.slice(0, itemsToShow),
        })),
      );
  }
}
