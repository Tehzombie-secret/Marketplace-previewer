import { WBSimilarData } from './wb-similar-data.interface';

export interface WBSimilar {
  state: number;
  data: WBSimilarData;
  error?: unknown;
}
