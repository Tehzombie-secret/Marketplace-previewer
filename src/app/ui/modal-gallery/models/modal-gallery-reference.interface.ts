import { Params } from '@angular/router';

export interface ModalGalleryReference {
  path: string;
  params: Params;
  photo: string | null;
  title: string | null;
}
