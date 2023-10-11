import { APIPlatform } from '../../services/api/models/api-platform.enum';

export interface ProductReference {
  platform: APIPlatform;
  id: string;
  parentId: string;
  brand: string | null;
  title: string | null;
  thumbnail: string | null;
}
