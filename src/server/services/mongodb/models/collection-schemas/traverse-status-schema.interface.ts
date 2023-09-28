import { TraverseStatus } from '../traverse-status.enum';

export interface TraverseStatusSchema {
  status: TraverseStatus;
  /** In order to always write to same entry */
  key: 'status';
}
