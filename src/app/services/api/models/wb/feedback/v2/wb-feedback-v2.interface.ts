import { WBFeedbackAnswerV2 } from './wb-feedback-answer-v2.interface';
import { WBFeedbackHelpfulnessV2 } from './wb-feedback-helpfulness-v2.interface';
import { WBFeedbackUserV2 } from './wb-feedback-user-v2.interface';
import { WBFeedbackVideo } from './wb-feedback-video.interface';
import { WBFeedbackVotesV2 } from './wb-feedback-votes-v2.interface';

export interface WBFeedbackV2 {
  id: string;
  globalUserId: string;
  wbUserId: number;
  wbUserDetails: WBFeedbackUserV2;
  text: string;
  matchingSize: string;
  matchingPhoto: string;
  matchingDescription: string;
  productValuation: number;
  color: string;
  size: string;
  createdDate: string;
  updatedDate: string;
  answer?: WBFeedbackAnswerV2;
  feedbackHelpfulness?: WBFeedbackHelpfulnessV2[];
  photo?: number[];
  votes: WBFeedbackVotesV2;
  rank: number;
  video?: WBFeedbackVideo;
}
