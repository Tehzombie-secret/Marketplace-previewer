import { ReferenceType } from '../../../models/photo/reference-type.enum';
import { ModalGallery } from '../../modal-gallery/models/modal-gallery.interface';

export interface ImageOverlay<T extends ReferenceType, J extends ReferenceType> extends ModalGallery<T, J> {
  hideOverlay?: boolean;
  hasGalleryButton?: boolean;
}
