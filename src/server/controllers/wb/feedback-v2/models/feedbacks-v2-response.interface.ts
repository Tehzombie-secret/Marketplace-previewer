import { WBFeedbacksV2 } from '../../../../../app/services/api/models/wb/feedback/v2/wb-feedbacks-v2.interface';

export interface FeedbacksV2Response {
  hasError?: boolean;
  error?: any;
  response?: WBFeedbacksV2;
  status: number;
}
