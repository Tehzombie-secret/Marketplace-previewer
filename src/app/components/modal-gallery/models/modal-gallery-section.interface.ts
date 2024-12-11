import { PhotoEntityReference } from '../../../models/photo/photo-entity-reference.interface';
import { Photo } from '../../../models/photo/photo.interface';
import { ReferenceType } from '../../../models/photo/reference-type.enum';
import { ModalGalleryAuthor } from './modal-gallery-author.interface';

/** Represents a single feedback with multiple photos */
export interface ModalGallerySection<T extends ReferenceType> {
  video?: string;
  photos: Photo[];
  author: Partial<ModalGalleryAuthor> | null;
  reference: Partial<PhotoEntityReference<T>> | null;
}
