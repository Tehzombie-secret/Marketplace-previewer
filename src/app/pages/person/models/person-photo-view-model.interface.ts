import { Photo } from '../../../models/photo/photo.interface';
import { ReferenceType } from '../../../models/photo/reference-type.enum';
import { ImageOverlay } from '../../../ui/image-overlay/models/image-overlay.interface';

export interface PersonPhotoViewModel {
  gallery: ImageOverlay<ReferenceType.PRODUCT, ReferenceType.PERSON>;
  photo: Photo;
}
