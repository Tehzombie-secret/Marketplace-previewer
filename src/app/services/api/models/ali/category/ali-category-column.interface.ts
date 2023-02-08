import { AliCategoryColumnEntry } from './ali-category-column-entry.interface';

export interface AliCategoryColumn {
  items: AliCategoryColumnEntry[];
  groupTitle: string;
  groupUrl: string;
}
