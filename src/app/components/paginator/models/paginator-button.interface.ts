export interface PaginatorButton {
  page: number | null;
  /** Overrides label extracted from page, e.g. for next/prev buttons */
  label?: string;
  isActive?: boolean;
  withLeftMargin?: boolean;
  withRightMargin?: boolean;
}
