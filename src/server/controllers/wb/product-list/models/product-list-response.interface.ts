import { WBSimilar } from '../../../../../app/services/api/models/wb/similar/wb-similar.interface';

export interface ProductListResponse {
  hasError?: boolean;
  error?: any;
  notFound?: boolean;
  items?: WBSimilar;
}
