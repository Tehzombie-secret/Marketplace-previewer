import { WBPersonFeedback } from '../../services/wb-api/models/person/wb-person-feedback.interface';
import { WBPersonRoot } from '../../services/wb-api/models/person/wb-person-root.interface';
import { getUserFeedback, UserFeedback } from '../feedbacks/user-feedback.interface';
import { Photo } from '../photo/photo.interface';

export interface Person {
  type: 'person';
  id: number;
  externalURL: string;
  name: string;
  photo: string;
  country: string;
  feedbacks: Partial<UserFeedback>[];
  mergedPhotos: Photo[];
}

export function getPerson(id: number, dto?: WBPersonRoot): Partial<Person> {
  const feedbacks: Partial<UserFeedback>[] = (dto?.Value?.data?.profile?.feedbacks || [])
    .filter((feedback: WBPersonFeedback) => (feedback?.entity?.photos?.length || 0) > 0)
    .map((feedback: WBPersonFeedback) => getUserFeedback(feedback))
  const item: Partial<Person> = {
    type: 'person',
    id,
    externalURL: `https://www.wildberries.ru${dto?.path}`,
    name: dto?.Value?.data?.profile?.userName,
    photo: dto?.Value?.data?.profile?.userPhotoLink,
    country: dto?.Value?.data?.profile?.country,
    feedbacks,
    mergedPhotos: feedbacks.flatMap((value: Partial<UserFeedback>) => value.photos || []),
  };

  return item;
}
