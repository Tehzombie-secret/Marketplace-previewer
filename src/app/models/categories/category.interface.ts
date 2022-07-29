import { APIPlatform } from '../../services/api/models/api-platform.enum';

export interface Category {
  title: string;
  slug: string | number | null;
  children: Category[];
  platform: APIPlatform;
}

export function flatCategories(categories?: Category[] | null): Category[] {
  const items = (categories || []).flatMap((item: Category) => flatCategories(item.children).concat(item));

  return items;
}
