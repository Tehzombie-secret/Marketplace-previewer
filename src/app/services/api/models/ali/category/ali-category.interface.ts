import { AliCategoryBrand } from './ali-category-brand.interface';
import { AliCategoryColumn } from './ali-category-column.interface';
import { AliCategorySearch } from './ali-category-search.interface';
import { AliCategoryTitle } from './ali-category-title.interface';

export interface AliCategory {
  title: AliCategoryTitle[];
  name: string;
  columns: AliCategoryColumn[][];
  brands: AliCategoryBrand[];
  dataSpm: string;
  dataPath: string;
  searchSnippets: AliCategorySearch[];
  separator: string;
}
