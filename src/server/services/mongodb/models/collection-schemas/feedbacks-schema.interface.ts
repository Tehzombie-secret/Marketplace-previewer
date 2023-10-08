export interface FeedbacksSchema {
  /** Feedback id */
  id: string;
  /** User id */
  uId: string;
  /** User name */
  un: string;
  /** Post date */
  d: string;
  /** Feedback post */
  t: string;
  /** Product id */
  pId: number;
  /** Product parent id */
  ppId: number;
  /** Product brand */
  b: string;
  /** Product name */
  n: string;
  /** Product photo */
  pp: string;
  /** Feedback photo ids */
  p: number[];
  /** Feedback score (used for feedback sorting) */
  v: number;
}
