import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { truthy } from '../../../../helpers/truthy';
import { ReferenceType } from '../../../../models/photo/reference-type.enum';
import { ModalGalleryComponent } from '../../../../ui/modal-gallery/modal-gallery.component';
import { ModalGallery } from '../../../../ui/modal-gallery/models/modal-gallery.interface';
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
    MatDialogModule,
    PreviewsComponent,
    ModalGalleryComponent,
  ],
})
export class ProductOverviewComponent {

  @Input() item?: ProductViewModel | null = null;

  get title(): string {
    return [this.item?.item?.brand, this.item?.item?.title]
      .filter(truthy)
      .join(' / ');
  }

  constructor(
    private dialog: MatDialog,
  ) {
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
    this.item = {
      ...this.item,
      activeImage: index,
    };
  }

  openGallery(index?: number): void {
    const data: ModalGallery<ReferenceType.PRODUCT, ReferenceType.PRODUCT> = {
      active: [0, index ?? this.item?.activeImage ?? 0],
      source: {
        type: ReferenceType.PRODUCT,
        item: this.item?.item,
      },
      images: [{
        photos: this.item?.item?.images ?? [],
        author: null,
        reference: null,
      }],
    };
    this.dialog.open(ModalGalleryComponent, {
      ariaLabel: 'Галерея изображений',
      closeOnNavigation: true,
      data,
    });
  }
}
