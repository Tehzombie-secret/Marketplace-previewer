import { UserFeedback } from '../../../../../app/models/feedbacks/user-feedback.interface';

export interface FeedbackSearchResponse {
  status: number;
  result?: Partial<UserFeedback>[];
  error?: any;
}
