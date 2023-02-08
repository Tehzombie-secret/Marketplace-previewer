import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, map, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { ROUTE_PATH } from '../../constants/route-path.const';
import { truthy } from '../../helpers/truthy';
import { AsyncFeedback } from '../../models/feedbacks/async-feedback.interface';
import { Feedback } from '../../models/feedbacks/feedback.interface';
import { ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { Product } from '../../models/product/product.interface';
import { PluralPipe } from '../../pipes/plural.pipe';
import { APIService } from '../../services/api/api.service';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { HistoryService } from '../../services/history/history.service';
import { VisitedEntryType } from '../../services/history/models/visited-entry-type.enum';
import { VisitedEntry } from '../../services/history/models/visited-entry.interface';

@Component({
  standalone: true,
  selector: 'wb-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatProgressSpinnerModule,
    PluralPipe,
  ],
})
export class ProductCardComponent implements OnChanges {

  @Input() item?: Partial<Product> | null = null;

  private readonly item$ = new BehaviorSubject<Partial<Product> | null>(null);
  readonly visitedEntry$ = this.getHistoryChanges(this.item$);
  readonly feedbacks$ = this.getFeedbacksChanges(this.item$);
  readonly feedbackPhotosPerProduct = 4;
  readonly productPath$ = this.getPathChanges(this.item$);

  get title(): string {
    return `${this.item?.brand ? this.item?.brand + ' / ' : ''}${this.item?.title}`;
  }

  constructor(
    private API: APIService,
    private history: HistoryService,
  ) {
  }

  ngOnChanges(): void {
    this.item$.next(this.item ?? null);
  }

  private getHistoryChanges(item$: Observable<Partial<Product> | null>): Observable<VisitedEntry | null> {
    return item$
      .pipe(
        switchMap((item: Partial<Product> | null) => item
          ? this.history.hasVisitedChanges(VisitedEntryType.PRODUCT, item.platform ?? APIPlatform.WB, item.parentId)
          : of(null)
        ),
      );
  }

  private getFeedbacksChanges(item$: Observable<Partial<Product> | null>): Observable<AsyncFeedback> {
    return item$
      .pipe(
        switchMap((item: Partial<Product> | null) => item
          ? this.API.getFeedbacksChanges(
            item,
            (items: ProductFeedbacks) => {
              const feedbacks = (items.feedbacks || []).filter((feedback: Partial<Feedback>) => feedback.photo?.length ?? 0 > 0);

              return feedbacks.length < this.feedbackPhotosPerProduct;
            },
          )
          : of(null)
        ),
        map((item: ProductFeedbacks | null) => {
          const feedback: AsyncFeedback = {
            isLoading: false,
            amount: item?.withPhotosSize ?? 0,
            photos: (item?.feedbacks || [])
              .map((feedback: Partial<Feedback>) => feedback.feedbackPhotos?.[0]?.small)
              .filter(truthy),
          };

          return feedback;
        }),
        startWith({ isLoading: true, amount: 0, photos: [] }), // It's null while it's loading
        shareReplay(1),
      );
  }

  private getPathChanges(item$: Observable<Partial<Product> | null>): Observable<string[]> {
    return item$
      .pipe(
        map((item: Partial<Product> | null) =>
          [`/${item?.platform}`, ROUTE_PATH.PRODUCT, `${item?.id ?? ''}`]
        ),
      );
  }
}
