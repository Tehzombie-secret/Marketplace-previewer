import { WBPhotoSize } from '../../models/feedbacks/wb/wb-photo-size.enum';
import { WBUserDetails } from '../../services/api/models/wb/feedback/v1/wb-user-details.interface';

const SIZE_TO_SUFFIX_STRATEGY: Record<WBPhotoSize, string> = {
  [WBPhotoSize.MEDIUM]: 'medium',
  [WBPhotoSize.SMALL]: 'small',
}

export function getWBUserPhoto(size: WBPhotoSize, details: WBUserDetails, id?: number | null): string {
  const suffix = SIZE_TO_SUFFIX_STRATEGY[size];
  const photo = details.hasPhoto && id
    ? `https://photos.wbstatic.net/img/${id}/${suffix}/PersonalPhoto.jpg`
    : `https://images.wbstatic.net/img/0/${suffix}/PersonalPhoto.png?2`;

  return photo;
}
