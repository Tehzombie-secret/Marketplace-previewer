import { ReferenceType } from '../../../models/photo/reference-type.enum';
import { ModalGalleryCurrentEntry } from './modal-gallery-current-entry.interface';

export type ModalGalleryReferenceStrategy<T> = {
  [K in ReferenceType]: (item: ModalGalleryCurrentEntry<K>) => T;
};

