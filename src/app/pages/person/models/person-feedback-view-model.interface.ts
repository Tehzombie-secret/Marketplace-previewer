import { UserFeedback } from '../../../models/feedbacks/user-feedback.interface';
import { PersonPhotoViewModel } from './person-photo-view-model.interface';

export interface PersonFeedbackViewModel extends Partial<UserFeedback> {
  photoViewModels: PersonPhotoViewModel[];
}
