import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { truthy } from '../../../../helpers/truthy';
import { ReferenceType } from '../../../../models/photo/reference-type.enum';
import { FriendlyDatePipe } from '../../../../pipes/friendly-date.pipe';
import { ImageOverlayComponent } from '../../../../ui/image-overlay/image-overlay.component';
import { ImageOverlay } from '../../../../ui/image-overlay/models/image-overlay.interface';
import { PreviewsComponent } from '../../../../ui/previews/previews.component';
import { ProductViewModel } from '../../models/product-view-model.interface';

@Component({
  standalone: true,
  selector: 'wb-product-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ImageOverlayComponent,
    PreviewsComponent,
  ],
  animations: [
    trigger('collapseInOut', [
      state('collapsed', style({ height: 0 })),
      state('opened', style({ height: '*' })),
      transition('collapsed => opened', animate('160ms ease-in')),
      transition('opened => collapsed', animate('160ms ease-out')),
    ]),
    trigger('imageShrinkInOut', [
      state('collapsed', style({ height: 90 })),
      state('opened', style({ height: 540 })),
      transition('collapsed => opened', animate('160ms ease-in')),
      transition('opened => collapsed', animate('160ms ease-out')),
    ]),
  ],
})
export class ProductOverviewComponent {

  @Input() item?: ProductViewModel | null = null;

  overlay: ImageOverlay<ReferenceType.PRODUCT, ReferenceType.PRODUCT> | null = null;

  get title(): string {
    return [this.item?.item?.brand, this.item?.item?.title]
      .filter(truthy)
      .join(' / ');
  }

  ngOnChanges(): void {
    this.overlay = {
      active: [0, this.item?.activeImage ?? 0],
      source: {
        type: ReferenceType.PRODUCT,
        item: this.item?.item,
      },
      hideOverlay: this.item?.overviewCollapsed,
      images: [{
        photos: this.item?.item?.images ?? [],
        author: null,
        reference: null,
      }],
    };
  }

  toggleDescription(): void {
    if (!this.item) {

      return;
    }
    this.item.descriptionExpanded = !this.item.descriptionExpanded;
  }

  selectImage(index: number): void {
    if (!this.item) {

      return;
    }
    this.item.activeImage = index;
  }

  toggleOverview(): void {
    if (!this.item) {

      return;
    }
    this.item.overviewCollapsed = !this.item?.overviewCollapsed;
  }
}
