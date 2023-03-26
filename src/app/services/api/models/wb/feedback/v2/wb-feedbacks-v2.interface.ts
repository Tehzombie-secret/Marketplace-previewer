import { WBFeedbackSizesV2 } from './wb-feedback-sizes-v2.interface';
import { WBFeedbackV2 } from './wb-feedback-v2.interface';

export interface WBFeedbacksV2 {
  photosUris: string[][];
  photo: number[];
  valuation: string;
  valuationSum: number;
  valuationDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  valuationDistributionPercent: Record<1 | 2 | 3 | 4 | 5, number>;
  matchingSizePercentages: WBFeedbackSizesV2;
  feedbackCount: number;
  feedbackCountWithPhoto: number;
  feedbacks: WBFeedbackV2[];
}
