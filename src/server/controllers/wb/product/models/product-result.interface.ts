import { WBProduct } from '../../../../../app/services/api/models/wb/product/wb-product.interface';

export interface WBProductResult {
  errorStatus?: number;
  error?: any;
  result?: WBProduct;
}
