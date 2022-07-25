import { Photo } from '../../../models/photo/photo.interface';
import { ReferenceType } from '../../../models/photo/reference-type.enum';
import { ModalGallery } from '../../../ui/modal-gallery/models/modal-gallery.interface';

export interface PersonPhotoViewModel {
  gallery: ModalGallery<ReferenceType.PRODUCT, ReferenceType.PERSON>;
  photo: Photo;
}
