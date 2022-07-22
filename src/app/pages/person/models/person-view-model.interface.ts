import { Person } from '../../../models/person/person.interface';
import { PersonFeedbackViewModel } from './person-feedback-view-model.interface';

export interface PersonViewModel extends Person {
  feedbackViewModels: PersonFeedbackViewModel[];
}
