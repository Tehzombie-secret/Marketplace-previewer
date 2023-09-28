import { WBSimilar } from '../../../../../app/services/api/models/wb/similar/wb-similar.interface';

export interface ProductListResponse {
  error?: any;
  items?: WBSimilar;
  status: number;
}
