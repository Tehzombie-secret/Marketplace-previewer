import { APIPlatform } from '../../api/models/api-platform.enum';
import { VisitedEntryType } from './visited-entry-type.enum';

export interface VisitRequest {
  type: VisitedEntryType;
  date: Date;
  platform: APIPlatform;
  title?: string;
  photo?: string | null;
  ids?: (string | number | undefined)[] | null;
}
