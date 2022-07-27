import { Category } from '../../../models/categories/category.interface';

export interface CategoryViewModel {
  expanded: boolean;
  url: string[];
  item: Category;
  children: CategoryViewModel[];
}
