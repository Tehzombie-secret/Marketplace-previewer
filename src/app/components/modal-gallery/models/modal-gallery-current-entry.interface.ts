import { Photo } from '../../../models/photo/photo.interface';
import { ReferenceType } from '../../../models/photo/reference-type.enum';
import { APIPlatform } from '../../../services/api/models/api-platform.enum';
import { ModalGallerySection } from './modal-gallery-section.interface';

export interface ModalGalleryCurrentEntry<T extends ReferenceType> {
  platform: APIPlatform;
  sectionIndex: number;
  photoIndex: number;
  globalIndex: number;
  section: ModalGallerySection<T>;
  photo: Photo;
}
