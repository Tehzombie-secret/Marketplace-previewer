import { ProductReference } from '../models/product/product-reference.interface';
import { truthy } from './truthy';

export function getProductName(product?: Partial<ProductReference> | null): string {
  if (!product) {

    return '';
  }

  return [product.brand, product.title]
    .filter(truthy)
    .join(' / ');
}
