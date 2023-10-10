import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, NgForOf, NgIf, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, map, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { filterTruthy } from '../../helpers/observables/filter-truthy';
import { treeFind } from '../../helpers/tree-find';
import { Categories } from '../../models/categories/categories.interface';
import { Category } from '../../models/categories/category.interface';
import { Product } from '../../models/product/product.interface';
import { APIService } from '../../services/api/api.service';
import { ToolbarService } from '../../services/toolbar/toolbar.service';
import { SEARCH_QUERY_PARAM } from './constants/search-query-param.const';
import { CatalogViewModel } from './models/catalog-view-model.interface';

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

  private readonly itemsPerPage = 7;
  visibleItems = this.itemsPerPage;
  readonly title$ = this.getNameChanges();
  private readonly retry$ = new BehaviorSubject<void>(void 0);
  readonly page$ = this.getCatalogChanges(this.retry$);
  private readonly subscription$ = new Subscription();
  readonly menuPath$ = this.getMenuPathChanges();

  constructor(
    private API: APIService,
    private route: ActivatedRoute,
    private title: Title,
    private cdr: ChangeDetectorRef,
    private toolbar: ToolbarService,
  ) {
  }

  ngOnInit(): void {
    this.listenPaginationResetChanges();
    this.listenTitleChanges();
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
    this.visibleItems += this.itemsPerPage;
  }

  private listenPaginationResetChanges(): void {
    const paginationSubscription$ = this.route.paramMap
      .pipe(
        map((paramMap: ParamMap) => paramMap.get('id')),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        this.visibleItems = this.itemsPerPage;
        this.cdr.markForCheck();
      });
    this.subscription$.add(paginationSubscription$);
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

  private getCatalogChanges(retry$: Observable<void>): Observable<CatalogViewModel> {
    const errorResponse: CatalogViewModel = {
      hasError: true,
      isLoading: false,
      items: [],
    };
    const isLoadingResponse: CatalogViewModel = {
      hasError: false,
      isLoading: true,
      items: [],
    };
    const emptyResponse: CatalogViewModel = {
      hasError: false,
      isLoading: false,
      items: [],
    };
    const queryAndIDTuple$ = combineLatest([
      this.route.paramMap.pipe(map((paramMap: ParamMap) => paramMap.get('id'))),
      this.route.queryParamMap.pipe(map((paramMap: ParamMap) => paramMap.get(SEARCH_QUERY_PARAM))),
    ]);

    return retry$
      .pipe(
        switchMap(() => queryAndIDTuple$),
        switchMap(([id, query]: (string | null)[]) => id || query
          ? (id ? this.API.getCatalogChanges(id) : this.API.getSearchChanges(query))
            .pipe(
              map((items: Partial<Product>[]) => {
                const viewModel: CatalogViewModel = { items, isLoading: false, hasError: false };

                return viewModel;
              }),
              startWith(isLoadingResponse),
            )
          : of(emptyResponse)
        ),
        catchError(() => of(errorResponse)),
      );
  }

  private getMenuPathChanges(): Observable<string[]> {
    return this.route.paramMap
      .pipe(
        map((paramMap: ParamMap) => [`/${paramMap.get('platform')}`]),
      );
  }

}
