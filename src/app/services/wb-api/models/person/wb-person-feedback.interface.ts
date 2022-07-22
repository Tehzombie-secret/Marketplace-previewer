import { WBFeedbackContent } from './wb-feedback-content.interface';
import { WBFeedbackProduct } from './wb-feedback-product.interface';

export interface WBPersonFeedback {
  entity: WBFeedbackContent;
  product: WBFeedbackProduct;
  searchPattern: string;
}
