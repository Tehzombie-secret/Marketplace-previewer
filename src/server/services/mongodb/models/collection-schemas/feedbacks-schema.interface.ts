export interface FeedbacksSchema {
  /** Feedback id */
  id: string;
  /** User id */
  uId: string | null;
  /** Another user id, either one of IDs should be present */
  uWId: string | null;
  /** User name */
  un: string;
  /** Post date */
  d: string;
  /** Feedback post */
  t: string;
  /** Product id */
  pId: string | null;
  /** Product parent id */
  ppId: string | null;
  /** Product brand */
  b: string;
  /** Product name */
  n: string;
  /** Feedback photo ids */
  p: number[];
  /** Video stream */
  vi?: string;
}
