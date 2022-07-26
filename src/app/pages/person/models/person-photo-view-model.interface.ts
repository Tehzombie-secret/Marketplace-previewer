import { ModalGallery } from '../../../components/modal-gallery/models/modal-gallery.interface';
import { Photo } from '../../../models/photo/photo.interface';
import { ReferenceType } from '../../../models/photo/reference-type.enum';

export interface PersonPhotoViewModel {
  gallery: ModalGallery<ReferenceType.PRODUCT, ReferenceType.PERSON>;
  photo: Photo;
}
