import { ImageSize } from '../../../server/models/image-size.enum';
import { proxifyLink } from '../../helpers/proxify-link';
import { getWBFeedbackImage } from '../../helpers/wb/get-wb-feedback-image';
import { getWBUserPhoto } from '../../helpers/wb/get-wb-user-photo';
import { getWBVideo, getWBVideoPreview } from '../../helpers/wb/get-wb-video';
import { WBFeedback } from '../../services/api/models/wb/feedback/v1/wb-feedback.interface';
import { WBFeedbacks } from '../../services/api/models/wb/feedback/v1/wb-feedbacks.interface';
import { WBPhoto } from '../../services/api/models/wb/feedback/v1/wb-photo.interface';
import { WBFeedbackV2 } from '../../services/api/models/wb/feedback/v2/wb-feedback-v2.interface';
import { WBFeedbacksV2 } from '../../services/api/models/wb/feedback/v2/wb-feedbacks-v2.interface';
import { Photo } from '../photo/photo.interface';
import { WBPhotoSize } from './wb/wb-photo-size.enum';

/** Simple version of feedback that lacks user information */
export interface Feedback {
  productId: string;
  userId: string;
  userWId: string;
  date: string;
  name: string;
  photo: string | null;
  feedback: string;
  feedbackPhotos: Photo[];
}

export function getFeedbackListFromWB(id: string | number | undefined, dto?: WBFeedbacks | null): Partial<Feedback>[] {
  const items: Partial<Feedback>[] = (dto?.feedbacks || [])
    .filter((feedback: WBFeedback) => (feedback?.photos?.length ?? 0) > 0)
    .map((feedback: WBFeedback) => {
      const item: Partial<Feedback> = {
        productId: `${id}`,
        feedback: feedback?.text,
        userId: feedback?.globalUserId,
        userWId: `${feedback.wbUserId}`,
        date: feedback?.createdDate,
        name: feedback?.wbUserDetails?.name || 'Без имени',
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

export function getFeedbackListFromWBV2(
  id: string | number | undefined,
  noPhotos: boolean,
  videosOnly: boolean,
  dto?: WBFeedbacksV2 | null
): Partial<Feedback>[] {
  const items: Partial<Feedback>[] = (dto?.feedbacks || [])
    .filter((feedback: WBFeedbackV2) => {
      const hasVideo = !videosOnly || feedback.video;
      const hasPhoto = noPhotos
        ? !feedback?.photo?.length
        : (feedback?.photo?.length ?? 0) > 0;

      return hasVideo || hasPhoto;
    })
    .sort((a: WBFeedbackV2, b: WBFeedbackV2) => b.rank - a.rank)
    .map((feedback: WBFeedbackV2) => {
      const photos: Photo[] = (feedback?.photo || []).map((photoId: number, index: number) => {
        const photo: Photo = {
          name: `feedback-${feedback?.globalUserId ?? feedback.wbUserId}-${id}-${index + 1}`,
          small: getWBFeedbackImage(photoId, ImageSize.SMALL),
          big: getWBFeedbackImage(photoId, ImageSize.BIG),
        };

        return photo;
      });
      if (feedback?.video?.id) {
        photos.unshift({
          name: `feedback-${feedback?.globalUserId ?? feedback.wbUserId}-${id}-v`,
          small: getWBVideoPreview(feedback.video.id),
          big: getWBVideoPreview(feedback.video.id),
          video: getWBVideo(feedback.video.id),
        });
      }
      const item: Partial<Feedback> = {
        productId: `${id}`,
        feedback: feedback?.text,
        userId: feedback?.globalUserId,
        userWId: `${feedback.wbUserId}`,
        date: feedback?.createdDate,
        name: feedback?.wbUserDetails?.name || 'Без имени',
        photo: getWBUserPhoto(WBPhotoSize.MEDIUM, feedback.wbUserDetails, feedback?.globalUserId ?? feedback.wbUserId),
        feedbackPhotos: photos,
      };

      return item;
    });

  return items;
}
