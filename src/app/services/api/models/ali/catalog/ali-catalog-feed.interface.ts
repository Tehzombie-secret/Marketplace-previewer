import { AliCatalogProduct } from './ali-catalog-product.interface';

export interface AliCatalogFeed {
  products: AliCatalogProduct[];
  type: number;
}
