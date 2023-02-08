export interface AliFeedbackReview {
  id: string;
  username: string;
  userUrl: string;
  rating: number;
  country: string;
  text: string;
  date: string;
  gallery: string[];
  additionalReview: { text: string, date: string };
}
