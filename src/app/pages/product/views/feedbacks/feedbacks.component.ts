import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Feedback } from '../../../../models/feedbacks/feedback.interface';
import { ProductFeedbacks } from '../../../../models/feedbacks/product-feedbacks.interface';
import { Photo } from '../../../../models/photo/photo.interface';
import { ReferenceType } from '../../../../models/photo/reference-type.enum';
import { PluralPipe } from '../../../../pipes/plural.pipe';
import { SettingsKey } from '../../../../services/settings/models/settings-key.enum';
import { SettingsService } from '../../../../services/settings/settings.service';
import { ImageOverlayComponent } from '../../../../ui/image-overlay/image-overlay.component';
import { ModalGallerySection } from '../../../../ui/modal-gallery/models/modal-gallery-section.interface';
import { FeedbackViewModel } from '../../models/feedback-view-model.interface';
import { ProductViewModel } from '../../models/product-view-model.interface';
import { ProductFeedbackViewModel } from './models/product-feedback-view-model.interface';
import { ProductPhotoViewModel } from './models/product-photo-view-model.interface';

@Component({
  standalone: true,
  selector: 'wb-product-feedbacks',
  templateUrl: './feedbacks.component.html',
  styleUrls: ['./feedbacks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    PluralPipe,
    ImageOverlayComponent,
  ],
})
export class ProductFeedbacksComponent {

  @Input() product?: ProductViewModel | null = null;
  @Input() item?: ProductFeedbacks | null = null;
  @Output() readonly retryFeedbacks = new EventEmitter<void>();

  galleryMode$ = this.settings.getChanges(SettingsKey.GALLERY_MODE);
  isLoading = true;
  hasError = false;
  progress = 12;
  photoSize = 0;
  feedbacks: ProductFeedbackViewModel[] = [];

  constructor(
    private settings: SettingsService,
  ) {
  }

  ngOnChanges(): void {
    this.isLoading = (this.item?.progress ?? 0) < 100;
    this.progress = this.item?.progress ?? 12;
    this.hasError = this.item?.hasError ?? false;
    const gallery = (this.item?.feedbacks ?? [])
      .filter((item: Partial<Feedback>) => (item.feedbackPhotos?.length ?? 0) > 0)
      .map((item: Partial<Feedback>) => {
        const section: ModalGallerySection<ReferenceType.PERSON> = {
          author: {
            date: item.date,
            quote: item.feedback,
          },
          reference: {
            type: ReferenceType.PERSON,
            item: {
              id: item.userId,
              name: item.name,
              photo: item.photo,
            },
          },
          photos: item.feedbackPhotos || [],
        };

        return section;
      });
    this.feedbacks = (this.item?.feedbacks ?? [])
      .filter((item: Partial<Feedback>) => (item.feedbackPhotos?.length ?? 0) > 0)
      .map((item: Partial<Feedback>, sectionIndex: number) => {
        const photos = (item.feedbackPhotos || []).map((photo: Photo, photoIndex: number) => {
          const viewModel: ProductPhotoViewModel = {
            photo,
            gallery: {
              active: [sectionIndex, photoIndex],
              source: {
                type: ReferenceType.PRODUCT,
                item: this.product?.item ?? null,
              },
              hasGalleryButton: false,
              hideOverlay: true,
              images: gallery,
            },
          };

          return viewModel;
        });
        const viewModel: ProductFeedbackViewModel = {
          item,
          photos,
        };

        return viewModel;
      });
    this.photoSize = (this.item?.feedbacks || [])
      .reduce((acc: number, value: Partial<Feedback>) => acc + (value?.feedbackPhotos?.length ?? 0), 0);
  }

  trackByFeedback(_index: number, item: ProductFeedbackViewModel): string {
    return `${item.item.userId}+_+${item.item.feedback}`;
  }

  trackByPhoto(_index: number, item: Partial<ProductPhotoViewModel>): string | null {
    return item.photo?.name ?? item.photo?.small ?? item.photo?.big ?? null;
  }

  retry(): void {
    this.retryFeedbacks.emit();
  }

  toggleGalleryMode(): void {
    this.settings.set(SettingsKey.GALLERY_MODE, !this.settings.get(SettingsKey.GALLERY_MODE));
  }
}
