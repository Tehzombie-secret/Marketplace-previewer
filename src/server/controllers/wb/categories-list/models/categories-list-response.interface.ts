export interface CategoriesListResponse<T> {
  status: number;
  result?: T[];
  error?: any;
}
