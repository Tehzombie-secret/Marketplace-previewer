export interface FeedbacksSchema {
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
  /** Product id */
  pId: number;
  /** Product parent id */
  ppId: number;
  /** Product brand */
  b: string;
  /** Product name */
  n: string;
  /** Feedback photo ids */
  p: number[];
}
