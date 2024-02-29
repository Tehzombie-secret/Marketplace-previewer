import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categories } from '../../models/categories/categories.interface';
import { Feedback } from '../../models/feedbacks/feedback.interface';
import { ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { Person } from '../../models/person/person.interface';
import { ProductReference } from '../../models/product/product-reference.interface';
import { Product } from '../../models/product/product.interface';
import { APIBridge } from './models/api-bridge.interface';

@Injectable({
  providedIn: 'root',
})
export class EtsyAPIService implements APIBridge {

  getCategoriesChanges(): Observable<Categories> {
    throw new Error('Method not implemented.');
  }

  getCatalogChanges(id?: string | number | null | undefined): Observable<Partial<Product>[]> {
    throw new Error('Method not implemented.');
  }

  getSearchChanges(query?: string | null | undefined): Observable<Partial<Product>[]> {
    throw new Error('Method not implemented.');
  }

  getUserChanges(id?: string | number | null | undefined): Observable<Partial<Person>> {
    throw new Error('Method not implemented.');
  }

  getProductChanges(id: string | number): Observable<Partial<Product>> {
    throw new Error('Method not implemented.');
  }

  getSimilarChanges(id: string | number): Observable<Partial<Product>[]> {
    throw new Error('Method not implemented.');
  }

  getFeedbackSearchChanges(query?: string | null): Observable<Partial<Feedback>[]> {
    throw new Error('Method not implemented');
  }

  getFeedbacksChanges(
    item: Partial<ProductReference> | null | undefined,
    noPhotos: boolean,
    fetchWhile?: ((items: ProductFeedbacks) => boolean) | null | undefined,
    existingAccumulator?: ProductFeedbacks | undefined): Observable<ProductFeedbacks> {
    throw new Error('Method not implemented.');
  }
}
