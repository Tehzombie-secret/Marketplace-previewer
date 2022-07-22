import { WBFeedbackHelpfulness } from './wb-feedback-helpfulness.interface';
import { WBFeedbackProduct } from './wb-feedback-product.interface';
import { WBPhoto } from './wb-photo.interface';
import { WBRetailerAnswer } from './wb-retailer-answer.interface';
import { WBUserDetails } from './wb-user-details.interface';
import { WBVotes } from './wb-votes.interface';

export interface WBFeedback {
  id: string;
  wbUserId: number;
  wbUserDetails: WBUserDetails;
  imtId: number;
  nmId: number;
  subjectId: number;
  /** Actual user feedback */
  text: string;
  pros: string;
  cons: string;
  isObscene: boolean;
  matchingSize: string;
  matchingPhoto: string;
  matchingDescription: string;
  visibility: string;
  productValuation: number;
  color: string;
  size: string;
  /** ISO date string */
  createdDate: string;
  /** ISO date string */
  updatedDate: string;
  answer: WBRetailerAnswer;
  state: string;
  /** Specificies which product was bought with detailed characteristics */
  productDetails: WBFeedbackProduct;
  defectType: string;
  feedbackHelpfulness: WBFeedbackHelpfulness[];
  photos: WBPhoto[];
  rank: number;
  wasViewed: boolean;
  votes: WBVotes;

  // TBD
  metadata?: any;
  problem?: any;
  video?: any;
}
