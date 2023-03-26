import { proxifyLink } from '../../helpers/proxify-link';
import { getWBUserPhoto } from '../../helpers/wb/get-wb-user-photo';
import { WBFeedback } from '../../services/api/models/wb/feedback/v1/wb-feedback.interface';
import { WBFeedbacks } from '../../services/api/models/wb/feedback/v1/wb-feedbacks.interface';
import { WBPhoto } from '../../services/api/models/wb/feedback/v1/wb-photo.interface';
import { WBFeedbackV2 } from '../../services/api/models/wb/feedback/v2/wb-feedback-v2.interface';
import { WBFeedbacksV2 } from '../../services/api/models/wb/feedback/v2/wb-feedbacks-v2.interface';
import { Photo } from '../photo/photo.interface';
import { WBPhotoSize } from './wb/wb-photo-size.enum';

export interface Feedback {
  productId: number;
  userId: number;
  date: string;
  name: string;
  photo: string;
  country: string;
  feedback: string;
  feedbackPhotos: Photo[];
}

export function getFeedbackListFromWB(id: number | undefined, dto?: WBFeedbacks | null): Partial<Feedback>[] {
  const items: Partial<Feedback>[] = (dto?.feedbacks || [])
    .filter((feedback: WBFeedback) => (feedback?.photos?.length ?? 0) > 0)
    .map((feedback: WBFeedback) => {
      const item: Partial<Feedback> = {
        productId: id,
        feedback: feedback?.text,
        userId: feedback?.wbUserId,
        date: feedback?.createdDate,
        name: feedback?.wbUserDetails?.name || 'Без имени',
        country: feedback?.wbUserDetails?.country,
        photo: getWBUserPhoto(WBPhotoSize.MEDIUM, feedback.wbUserDetails, feedback.wbUserId),
        feedbackPhotos: (feedback?.photos || []).map((photoDTO: WBPhoto, index: number) => {
          const photo: Photo = {
            name: `feedback-${feedback?.wbUserId}-${id}-${index + 1}`,
            small: photoDTO.minSizeUri ? proxifyLink(`https://feedbackphotos.wbstatic.net/${photoDTO.minSizeUri}`) : null,
            big: photoDTO.fullSizeUri ? proxifyLink(`https://feedbackphotos.wbstatic.net/${photoDTO.fullSizeUri}`) : null,
          };

          return photo;
        }),
      };

      return item;
    });

  return items;
}

export function getFeedbackListFromWBV2(id: number | undefined, dto?: WBFeedbacksV2 | null): Partial<Feedback>[] {
  const items: Partial<Feedback>[] = (dto?.feedbacks || [])
    .filter((feedback: WBFeedbackV2) => (feedback?.photos?.length ?? 0) > 0)
    .sort((a: WBFeedbackV2, b: WBFeedbackV2) => (a.votes.pluses - a.votes.minuses / 2) - (b.votes.pluses - b.votes.minuses / 2))
    .map((feedback: WBFeedbackV2) => {
      const item: Partial<Feedback> = {
        productId: id,
        feedback: feedback?.text,
        userId: feedback?.wbUserId,
        date: feedback?.createdDate,
        name: feedback?.wbUserDetails?.name || 'Без имени',
        country: feedback?.wbUserDetails?.country,
        photo: getWBUserPhoto(WBPhotoSize.MEDIUM, feedback.wbUserDetails, feedback.wbUserId),
        feedbackPhotos: (feedback?.photos || []).map((photoDTO: WBPhoto, index: number) => {
          const photo: Photo = {
            name: `feedback-${feedback?.wbUserId}-${id}-${index + 1}`,
            small: photoDTO.minSizeUri ? proxifyLink(`https://feedbackphotos.wbstatic.net/${photoDTO.minSizeUri}`) : null,
            big: photoDTO.fullSizeUri ? proxifyLink(`https://feedbackphotos.wbstatic.net/${photoDTO.fullSizeUri}`) : null,
          };

          return photo;
        }),
      };

      return item;
    });

  return items;
}
