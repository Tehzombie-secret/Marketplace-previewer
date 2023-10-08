import { Person } from '../../../../../app/models/person/person.interface';

export interface UserResponse {
  error?: any;
  response?: Partial<Person>;
  status: number;
}
