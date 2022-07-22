import { WBPersonFeedback } from './wb-person-feedback.interface';

export interface WBPerson {
  userName: string;
  userPhotoLink: string;
  registeredTime: string;
  country: string;
  birthday: string;
  favoriteBrandsCount: number;
  feedbacksCount: number;
  feedbacks: WBPersonFeedback[];
  tabsNames: Record<string, string>;
}
