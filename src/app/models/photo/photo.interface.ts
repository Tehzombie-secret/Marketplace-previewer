export interface Photo {
  name: string;
  big: string | null;
  small: string | null;
  /** URL to video if photo preview is video */
  video?: string;
}
