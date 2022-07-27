import { APIPlatform } from '../../services/api/models/api-platform.enum';

export interface Category {
  title: string;
  slug: string | number;
  children: Category[];
  platform: APIPlatform;
}
