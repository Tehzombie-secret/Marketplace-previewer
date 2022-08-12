import { APIPlatform } from '../../api/models/api-platform.enum';
import { VisitedEntryType } from './visited-entry-type.enum';

export interface HistoryEntry {
  /** Timestamp */
  date: number;
  id: string;
  platform: APIPlatform;
  type: VisitedEntryType;
  title?: string;
  photo?: string | null;
}
