import { WBFeedback } from './wb-feedback.interface';

export interface WBFeedbacks {
  /** Photo paths, grouped by author */
  photosUris: string[][];
  /** Product score */
  valuation: number;
  /** How much photos feedback does this product have */
  feedbackCountWithPhoto: number;
  /** How much videos feedback does this product have */
  feedbackCountWithVideo: number;
  /** How much feedbacks overall */
  feedbackCount: number;
  valuationDistribution: Record<'1' | '2' | '3' | '4' | '5', number>;
  matchingSizeDistribution: Record<'bigger' | 'ok' | 'smaller', number>;
  valuationSum: number;
  feedbacks: WBFeedback[];
}
