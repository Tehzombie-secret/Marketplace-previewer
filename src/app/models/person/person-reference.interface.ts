import { APIPlatform } from '../../services/api/models/api-platform.enum';

/** Like person, but compact */
export interface PersonReference {
  platform: APIPlatform;
  id: number;
  name: string | null;
  photo: string | null;
}
