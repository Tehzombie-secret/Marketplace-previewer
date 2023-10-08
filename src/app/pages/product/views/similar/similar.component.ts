import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Product } from '../../../../models/product/product.interface';
import { APIService } from '../../../../services/api/api.service';
import { ProductViewModel } from '../../models/product-view-model.interface';
import { ProductCardComponent } from '../../../../components/product-card/product-card.component';

@Component({
  standalone: true,
  selector: 'wb-product-similar',
  templateUrl: './similar.component.html',
  styleUrls: ['./similar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ProductCardComponent,
  ],
})
export class ProductSimilarComponent implements OnChanges, OnDestroy {

  @Input() item?: ProductViewModel | null = null;

  items: Partial<Product>[] = [];
  isLoading = false;
  canLoadMore = true;
  private readonly itemsPerPage = 7;
  private subscriptions$ = new Subscription();
  private page = 0;

  get hasItems(): boolean {
    return this.items.length > 0;
  }

  constructor(
    private API: APIService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnChanges(): void {
    this.items = [];
    this.page = 0;
    this.isLoading = false;
    this.canLoadMore = true;
    this.subscriptions$.unsubscribe();
    this.subscriptions$ = new Subscription();
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
  }

  trackByProduct(_index: number, item: Partial<Product>): string | number | null {
    return item.id ?? null;
  }

  loadMore(): void {
    if (!this.item?.item?.id) {

      return;
    }
    this.isLoading = true;
    const fetchSubscription$ = this.API.getSimilarChanges(this.item?.item?.id)
      .subscribe((items: Partial<Product>[]) => {
        const start = this.page * this.itemsPerPage;
        const slicedItems = items.slice(start, start + this.itemsPerPage);
        this.items.push(...slicedItems);
        this.isLoading = false;
        this.canLoadMore = this.items.length < items.length;
        this.page++;
        this.cdr.markForCheck();
      });
    this.subscriptions$.add(fetchSubscription$);
  }

}
