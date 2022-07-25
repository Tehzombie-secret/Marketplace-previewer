import { proxifyLink } from '../../helpers/proxify-link';
import { getWBUserPhoto } from '../../helpers/wb/get-wb-user-photo';
import { WBFeedback } from '../../services/api/models/wb/feedback/wb-feedback.interface';
import { WBFeedbacks } from '../../services/api/models/wb/feedback/wb-feedbacks.interface';
import { WBPhoto } from '../../services/api/models/wb/feedback/wb-photo.interface';
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
        name: feedback?.wbUserDetails?.name,
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
