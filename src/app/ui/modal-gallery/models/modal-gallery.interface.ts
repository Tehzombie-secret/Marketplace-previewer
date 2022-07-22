import { PhotoEntityReference } from '../../../models/photo/photo-entity-reference.interface';
import { ReferenceType } from '../../../models/photo/reference-type.enum';
import { ModalGallerySection } from './modal-gallery-section.interface';

export interface ModalGallery<T extends ReferenceType, J extends ReferenceType> {
  source: Partial<PhotoEntityReference<J>> | null;
  /** Images is a two-dimensional array, so we need both indexes */
  active: [number, number];
  images?: ModalGallerySection<T>[] | null;
}
