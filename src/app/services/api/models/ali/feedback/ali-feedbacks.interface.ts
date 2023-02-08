import { AliFeedbackFilters } from './ali-feedback-filters.interface';
import { AliFeedbackReview } from './ali-feedback-review.interface';

export interface AliFeedbacks {
  filters: AliFeedbackFilters;
  count: number;
  reviews: AliFeedbackReview[];
  page: number;
  totalPages: number;
  fromAER: boolean;
}
