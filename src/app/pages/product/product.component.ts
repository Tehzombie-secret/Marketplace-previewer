import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { catchError, combineLatest, filter, map, merge, Observable, of, ReplaySubject, startWith, Subject, Subscription, switchMap, withLatestFrom } from 'rxjs';
import { filterTruthy } from '../../helpers/observables/filter-truthy';
import { truthy } from '../../helpers/truthy';
import { ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { Product } from '../../models/product/product.interface';
import { FriendlyDatePipe } from '../../pipes/friendly-date.pipe';
import { APIService } from '../../services/api/api.service';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { HistoryService } from '../../services/history/history.service';
import { VisitRequest } from '../../services/history/models/visit-request.interface';
import { VisitedEntryType } from '../../services/history/models/visited-entry-type.enum';
import { VisitedEntry } from '../../services/history/models/visited-entry.interface';
import { ToolbarService } from '../../services/toolbar/toolbar.service';
import { ProductViewModel } from './models/product-view-model.interface';
import { ProductFeedbacksComponent } from './views/feedbacks/feedbacks.component';
import { ProductOverviewComponent } from './views/overview/overview.component';
import { ProductSimilarComponent } from './views/similar/similar.component';

@Component({
  standalone: true,
  selector: 'wb-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProductOverviewComponent,
    ProductFeedbacksComponent,
    ProductSimilarComponent,
    FriendlyDatePipe,
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
export class ProductComponent implements OnInit, OnDestroy {

  readonly id$ = this.getIdChanges();
  readonly product$ = this.getProductChanges(this.id$);
  private readonly retryFeedbacks$ = new Subject<void>();
  readonly feedbacks$ = this.getSafeFeedbackChanges(this.getFeedbackChanges(this.product$), this.retryFeedbacks$);
  private readonly visitDate$ = new ReplaySubject<Date>(1);
  readonly visitedEntry$ = this.getVisitedChanges(this.visitDate$, this.product$);
  private readonly subscriptions$ = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private API: APIService,
    private title: Title,
    private history: HistoryService,
    private toolbar: ToolbarService,
  ) {
  }

  ngOnInit(): void {
    this.toolbar.setTitle('Товар');

    const effectsSubscription$ = this.product$.subscribe((item: Partial<ProductViewModel>) => {
      const title = [item?.item?.brand, item?.item?.title]
        .filter(truthy)
        .join(' / ')
      if (item?.item?.id) {
        const date = new Date();
        this.visitDate$.next(date);
        const visit: VisitRequest = {
          type: VisitedEntryType.PRODUCT,
          date,
          title,
          platform: item.item.platform ?? APIPlatform.WB,
          ids: [item.item.id, item.item.parentId],
          photo: item.item?.images?.[0]?.small,
        };
        this.history.visit(visit);
      }
      this.title.setTitle(title || 'Товар');
    });
    this.subscriptions$.add(effectsSubscription$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }

  retryFeedbacks(): void {
    this.retryFeedbacks$.next();
  }

  private getIdChanges(): Observable<string> {
    return this.activatedRoute.paramMap
      .pipe(
        map((paramMap: ParamMap) => paramMap.get('id')),
        filterTruthy(),
      );
  }

  private getVisitedChanges(date$: Observable<Date>, product$: Observable<ProductViewModel>): Observable<VisitedEntry | null> {
    return combineLatest([
      product$,
      date$,
    ])
      .pipe(
        switchMap(([product, date]: [ProductViewModel, Date]) => product
          ? this.history.hasVisitedChanges(VisitedEntryType.PRODUCT, product.item?.platform ?? APIPlatform.WB, product.item?.parentId, date)
          : of(null)
        ),
      );
  }

  private getProductChanges(id$: Observable<string>): Observable<ProductViewModel> {
    return id$
      .pipe(
        switchMap((id: string) => this.API.getProductChanges(id)),
        map((product: Partial<Product>) => ({ isLoading: false, item: product })),
        catchError((error: HttpErrorResponse) => of({ isLoading: false, error })),
        startWith({ isLoading: true }),
      );
  }

  private getSafeFeedbackChanges(feedbacks$: Observable<ProductFeedbacks>, retrySignal$: Observable<void>): Observable<ProductFeedbacks> {
    return merge(
      feedbacks$,
      retrySignal$
        .pipe(
          switchMap(() => this.product$),
          filter((item: ProductViewModel) => !item.isLoading),
          map((item: ProductViewModel) => item.item),
          filterTruthy(),
          withLatestFrom(feedbacks$),
          switchMap(([product, feedbacks]: [Partial<Product>, ProductFeedbacks]) => this.API.getFeedbacksChanges(product, null, feedbacks)),
        ),
    );
  }

  private getFeedbackChanges(product$: Observable<ProductViewModel>): Observable<ProductFeedbacks> {
    return product$
      .pipe(
        filter((item: ProductViewModel) => !item.isLoading),
        map((item: ProductViewModel) => item.item),
        filterTruthy(),
        switchMap((item: Partial<Product>) => this.API.getFeedbacksChanges(item)),
      );
  }
}
