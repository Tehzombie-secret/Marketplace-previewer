import { Categories } from '../../../../../models/categories/categories.interface';
import { Category } from '../../../../../models/categories/category.interface';
import { APIPlatform } from '../../api-platform.enum';

export interface WBCategory {
  id: number;
  name: string;
  url: string;
  shard: string;
  query: string;
  landing: boolean;
  childs: WBCategory[];
  seo: string;
  isDenyLink?: boolean;
  dest: number[];
  parent?: number;
}

export function getCategoriesChunkFromWB(categories?: WBCategory[] | null): Categories {
  const items: Categories = {
    items: getCategoriesFromWB(categories || []),
  };

  return items;
}

export function getCategoriesFromWB(categories?: WBCategory[] | null): Category[] {
  const items: Category[] = (categories || [])
    .map((dto: WBCategory) => {
      const item: Category = {
        platform: APIPlatform.WB,
        title: dto?.name,
        shard: dto?.shard,
        query: dto?.query,
        slug: !dto?.landing && dto?.query ? dto?.id : null,
        children: getCategoriesFromWB(dto?.childs),
      };

      return item;
    });

  return items;
}
