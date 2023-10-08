export interface PartialFeedbacksSchema {
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
    /** Feedback photo ids */
    p: number[];
    /** Feedback score (used for feedback sorting) */
    v: number;
}
