export interface FeedbacksSchema {
  /** Feedback id */
  id: string;
  /** User id */
  uId: number;
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
  /** Feedback photos (small) */
  ps: string[];
  /** Feedback photos (large) */
  pl: string[];
  /** Is obscene */
  o: boolean;
}
