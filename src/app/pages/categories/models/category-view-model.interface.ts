import { Category } from '../../../models/categories/category.interface';

export interface CategoryViewModel {
  expanded: boolean;
  url: string[] | null;
  item: Category;
  children: CategoryViewModel[];
}
