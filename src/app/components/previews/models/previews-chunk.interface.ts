import { Photo } from '../../../models/photo/photo.interface';

export interface PreviewChunk {
  id: string;
  photos?: Photo[] | null;
}
