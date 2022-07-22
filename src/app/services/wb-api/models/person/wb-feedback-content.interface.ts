import { WBFeedbackPhoto } from './wb-feedback-photo.interface';

export interface WBFeedbackContent {
  guid: string;
  color: string;
  size: string;
  mark: number;
  votePlus: number;
  voteMinus: number;
  userPhysicalParameters?: any;
  visibility: number;
  visibilityStringed: string;
  visibilityName: string;
  sizeMatch: number;
  fotoMatch: number;
  descriptionMatch: number;
  answeredBySupplier: boolean;
  photos: WBFeedbackPhoto[];
  rank: number;
  userCommentsCount: number;
  cons: string;
  pros: string;
  excludedFromRating: boolean;
  id: string;
  postDate: string;
  text: string;
  answer: string;
  country: string;
  userId: number;
  userName: string;
  hasPhoto: boolean;
  updatedFromUserInfo: boolean;
  locale: number;
  dateFormated: string;
  userSomeId: string;
  countryShortName: string;
}
