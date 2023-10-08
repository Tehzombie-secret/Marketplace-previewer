import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { WBPersonFeedback } from '../../services/api/models/wb/person/wb-person-feedback.interface';
import { WBPersonRoot } from '../../services/api/models/wb/person/wb-person-root.interface';
import { getUserFeedbackFromWB, UserFeedback } from '../feedbacks/user-feedback.interface';
import { Photo } from '../photo/photo.interface';

export interface Person {
  platform: APIPlatform;
  id: number;
  externalURL: string;
  name: string;
  photo: string;
  country: string;
  feedbacks: Partial<UserFeedback>[];
  mergedPhotos: Photo[];
}

export function getPersonFromWB(id: number | string, dto?: WBPersonRoot): Partial<Person> {
  const data = dto?.Value?.data ?? dto?.value?.data;
  const feedbacks: Partial<UserFeedback>[] = (data?.profile?.feedbacks || [])
    .filter((feedback: WBPersonFeedback) => (feedback?.entity?.photos?.length || 0) > 0)
    .map((feedback: WBPersonFeedback) => getUserFeedbackFromWB(feedback));
  const item: Partial<Person> = {
    platform: APIPlatform.WB,
    id: +id,
    externalURL: `https://www.wildberries.ru${dto?.path}`,
    name: data?.profile?.userName || 'Без имени',
    photo: data?.profile?.userPhotoLink,
    country: data?.profile?.country,
    feedbacks,
    mergedPhotos: feedbacks.flatMap((value: Partial<UserFeedback>) => value.photos || []),
  };

  return item;
}
