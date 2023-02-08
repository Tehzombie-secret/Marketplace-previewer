import { Categories } from '../../../../../models/categories/categories.interface';
import { Category } from '../../../../../models/categories/category.interface';
import { APIPlatform } from '../../api-platform.enum';
import { AliCategoryColumnEntry } from './ali-category-column-entry.interface';
import { AliCategoryColumn } from './ali-category-column.interface';
import { AliCategoryTitle } from './ali-category-title.interface';
import { AliCategory } from './ali-category.interface';

export interface AliCategories {
  categories: AliCategory[];
  rootTitleLink: string;
  hotGoodsLink: string;
}

export function getCategoriesChunkFromAli(categories?: AliCategories | null): Categories {
  const items: Categories = {
    items: getCategoriesFromAli(categories?.categories || []),
  };

  return items;
}

export function getCategoriesFromAli(categories?: AliCategory[] | null): Category[] {
  // Title url example: //aliexpress.ru/category/202000008/home-garden.html
  const slugRegExp = /\/(\d+)\//;

  const items: Category[] = (categories || [])
    .flatMap((dto: AliCategory) => (dto.title || []).map((title: AliCategoryTitle) => {
      const titleAnalyze = slugRegExp.exec(title?.url);
      const item: Category = {
        platform: APIPlatform.ALI,
        title: title?.text,
        slug: titleAnalyze?.[1] ?? null,
        children: (dto.columns || [])
          .flat()
          .map((columnDTO: AliCategoryColumn) => {
            const columnAnalyze = slugRegExp.exec(columnDTO.groupUrl);
            const column: Category = {
              platform: APIPlatform.ALI,
              title: columnDTO.groupTitle,
              slug: columnAnalyze?.[1] ?? null,
              children: columnDTO.items.map((entryDTO: AliCategoryColumnEntry) => {
                const entryAnalyze = slugRegExp.exec(entryDTO.url);
                const entry: Category = {
                  platform: APIPlatform.ALI,
                  title: entryDTO.name,
                  slug: entryAnalyze?.[1] ?? null,
                  children: [],
                };

                return entry;
              }),
            };

            return column;
          }),
      };

      return item;
    }));

  return items;
}
