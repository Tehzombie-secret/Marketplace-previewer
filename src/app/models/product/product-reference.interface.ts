import { APIPlatform } from '../../services/api/models/api-platform.enum';

export interface ProductReference {
  platform: APIPlatform;
  id: number;
  parentId: number;
  brand: string | null;
  title: string | null;
  thumbnail: string | null;
}
