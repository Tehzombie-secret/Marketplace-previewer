import { Product } from '../../../models/product/product.interface';

export interface CatalogViewModel {
  isLoading: boolean;
  hasError: boolean;
  items: Partial<Product>[];
}
