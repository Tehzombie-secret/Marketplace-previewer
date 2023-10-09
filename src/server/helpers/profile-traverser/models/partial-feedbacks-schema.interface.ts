export interface PartialFeedbacksSchema {
  /** Feedback id */
  id: string;
  /** User id */
  uId: string;
  /** Another user id, either one of IDs should be present */
  uWId: string;
  /** User name */
  un: string;
  /** Post date */
  d: string;
  /** Feedback post */
  t: string;
  /** Feedback photo ids */
  p: number[];
  /** Feedback score (used for feedback sorting) */
  v: number;
}
