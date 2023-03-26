import { WBFeedbacks } from '../../services/api/models/wb/feedback/v1/wb-feedbacks.interface';
import { WBFeedbacksV2 } from '../../services/api/models/wb/feedback/v2/wb-feedbacks-v2.interface';
import { Feedback, getFeedbackListFromWB, getFeedbackListFromWBV2 } from './feedback.interface';

export interface ProductFeedbacks {
  /** Loading progress from 0 to 100 */
  progress: number;
  hasError: boolean;
  requestsMade: number;
  size: number | null;
  withPhotosSize: number | null;
  feedbacks: Partial<Feedback>[];
}

export function getProductFeedbacksFromWB(
  id: number | undefined,
  progress: number,
  requestsMade: number,
  dto?: WBFeedbacks | null,
): ProductFeedbacks {
  const item: ProductFeedbacks = {
    progress,
    size: dto?.feedbackCount ?? 0,
    withPhotosSize: dto?.feedbackCountWithPhoto ?? 0,
    feedbacks: getFeedbackListFromWB(id, dto),
    hasError: false,
    requestsMade,
  };

  return item;
}

export function getProductFeedbacksFromWBV2(id: number | undefined, dto?: WBFeedbacksV2 | null): ProductFeedbacks {
  const item: ProductFeedbacks = {
    progress: 100,
    size: dto?.feedbackCount ?? 0,
    withPhotosSize: dto?.feedbackCountWithPhoto ?? 0,
    feedbacks: getFeedbackListFromWBV2(id, dto),
    hasError: false,
    requestsMade: 1,
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
