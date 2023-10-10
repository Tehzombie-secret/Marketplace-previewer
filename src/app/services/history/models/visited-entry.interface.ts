import { APIPlatform } from '../../api/models/api-platform.enum';
import { VisitedEntryType } from './visited-entry-type.enum';

export interface VisitedEntry {
  date: string[];
  id: string;
  platform: APIPlatform;
  type: VisitedEntryType;
  title?: string;
  photo?: string | null;
  sortByDate?: boolean;
}
