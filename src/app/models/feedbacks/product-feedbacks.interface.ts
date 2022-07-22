import { WBFeedbacks } from '../../services/wb-api/models/feedback/wb-feedbacks.interface';
import { Feedback, getFeedbackList } from './feedback.interface';

export interface ProductFeedbacks {
  /** Loading progress from 0 to 100 */
  progress: number;
  hasError: boolean;
  requestsMade: number;
  size: number | null;
  withPhotosSize: number | null;
  feedbacks: Partial<Feedback>[];
}

export function getProductFeedbacks(id: number | undefined, progress: number, requestsMade: number, dto?: WBFeedbacks | null): ProductFeedbacks {
  const item: ProductFeedbacks = {
    progress,
    size: dto?.feedbackCount ?? 0,
    withPhotosSize: dto?.feedbackCountWithPhoto ?? 0,
    feedbacks: getFeedbackList(id, dto),
    hasError: false,
    requestsMade,
  };

  return item;
}

export function getErrorProductFeedback(requestsMade: number, progress: number): ProductFeedbacks {
  const item: ProductFeedbacks = {
    hasError: true,
    requestsMade,
    progress,
    feedbacks: [],
    size: null,
    withPhotosSize: null,
  };

  return item;
}

export function mergeProductFeedbacks(acc: ProductFeedbacks, value: ProductFeedbacks): ProductFeedbacks {
  const hasError = value.hasError ?? acc.hasError;
  const item: ProductFeedbacks = {
    hasError,
    requestsMade: value.requestsMade ?? acc.requestsMade,
    size: value?.size ?? acc?.size ?? 0,
    progress: value.progress ?? acc.progress ?? 0,
    withPhotosSize: value?.withPhotosSize ?? acc?.withPhotosSize ?? 0,
    feedbacks: [
      ...(acc?.feedbacks || []),
      ...(value?.feedbacks || []),
    ],
  };

  return item;
}
