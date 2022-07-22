import { HttpErrorResponse } from '@angular/common/http';
import { ProductFeedbacks } from '../../../models/feedbacks/product-feedbacks.interface';


export interface FeedbackViewModel {
  item?: Partial<ProductFeedbacks>;
  error?: HttpErrorResponse;
}
