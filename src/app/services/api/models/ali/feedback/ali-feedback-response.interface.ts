import { Feedback } from '../../../../../models/feedbacks/feedback.interface';
import { ProductFeedbacks } from '../../../../../models/feedbacks/product-feedbacks.interface';
import { Photo } from '../../../../../models/photo/photo.interface';
import { AliFeedbackReview } from './ali-feedback-review.interface';
import { AliFeedbacks } from './ali-feedbacks.interface';

export interface AliFeedbackResponse {
  isLogin: boolean;
  userId: number;
  reviewInfo: AliFeedbacks;
}

export function getProductFeedbacksFromAli(
  itemId: string,
  progress: number,
  requestsMade: number,
  dto?: AliFeedbackResponse | null,
): ProductFeedbacks {
  const feedbacks: ProductFeedbacks = {
    hasError: false,
    progress,
    requestsMade,
    size: dto?.reviewInfo?.filters?.currentCount ?? 0,
    withPhotosSize: dto?.reviewInfo?.filters?.withPhoto ?? 0,
    feedbacks: (dto?.reviewInfo?.reviews || [])
      .filter((review: AliFeedbackReview) => review.gallery?.length > 0)
      .map((review: AliFeedbackReview) => {
        const userURL = new URL(review?.userUrl);
        const feedback: Partial<Feedback> = {
          country: review.country?.toUpperCase(),
          date: review.date,
          name: review.username,
          userId: userURL.searchParams.get('ownerMemberId') ?? undefined,
          productId: itemId,
          feedback: review?.text,
          feedbackPhotos: review.gallery.map((gallery: string) => {
            const photo: Photo = {
              big: gallery,
              small: gallery,
              name: `feedback-ali-${review.userUrl}-${itemId}`,
            };

            return photo;
          }),
        };

        return feedback;
      }),
  }

  return feedbacks;
}
