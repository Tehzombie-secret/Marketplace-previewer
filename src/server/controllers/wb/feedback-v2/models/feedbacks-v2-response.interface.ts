import { WBFeedbacks } from '../../../../../app/services/api/models/wb/feedback/v1/wb-feedbacks.interface';

export interface FeedbacksV2Response {
  hasError?: boolean;
  error?: any;
  response?: WBFeedbacks;
  status: number;
}
