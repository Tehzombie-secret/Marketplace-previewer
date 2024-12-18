import { Observable } from 'rxjs';
import { Categories } from '../../../models/categories/categories.interface';
import { ProductFeedbacks } from '../../../models/feedbacks/product-feedbacks.interface';
import { UserFeedback } from '../../../models/feedbacks/user-feedback.interface';
import { Person } from '../../../models/person/person.interface';
import { ProductReference } from '../../../models/product/product-reference.interface';
import { Product } from '../../../models/product/product.interface';
import { FeedbackHint } from './feedback-hint.interface';

export interface APIBridge {

  getCategoriesChanges(): Observable<Categories>;
  getCatalogChanges(id?: number | string | null, page?: number | null): Observable<Partial<Product>[]>;
  getSearchChanges(query?: string | null, page?: number | null): Observable<Partial<Product>[]>;
  getUserChanges(id?: number | string | null, hint?: FeedbackHint | null): Observable<Partial<Person>>;
  getProductChanges(id: number | string): Observable<Partial<Product>>;
  getSimilarChanges(id: number | string): Observable<Partial<Product>[]>;
  getFeedbackSearchChanges(query?: string | null, page?: string | number | null): Observable<Partial<UserFeedback>[]>;
  getFeedbacksChanges(
    item: Partial<ProductReference> | null | undefined,
    noPhotos: boolean,
    videosOnly: boolean,
    fetchWhile?: ((items: ProductFeedbacks) => boolean) | null,
    existingAccumulator?: ProductFeedbacks,
  ): Observable<ProductFeedbacks>;

}
