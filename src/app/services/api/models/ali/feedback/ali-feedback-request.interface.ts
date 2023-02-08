export interface AliFeedbackRequest {
  local: boolean;
  page: number;
  pageSize: number;
  productId: string;
  sort: string;
  starFilter: string;
  translate: boolean;
}
