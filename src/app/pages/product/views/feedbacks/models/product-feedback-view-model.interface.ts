import { Feedback } from '../../../../../models/feedbacks/feedback.interface';
import { ProductPhotoViewModel } from './product-photo-view-model.interface';

export interface ProductFeedbackViewModel {
  item: Partial<Feedback>;
  photos: ProductPhotoViewModel[];
  hasNoContent: boolean;
}
