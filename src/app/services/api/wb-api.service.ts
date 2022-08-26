import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, map, NEVER, Observable, of } from 'rxjs';
import { catchError, delay, expand, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VendorPlatform } from '../../../server/models/image-platform.enum';
import { Categories } from '../../models/categories/categories.interface';
import { getErrorProductFeedback, getProductFeedbacksFromWB, mergeProductFeedbacks, ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { getPersonFromWB, Person } from '../../models/person/person.interface';
import { ProductReference } from '../../models/product/product-reference.interface';
import { mapProductFromWB, mapProductsFromSimilarWB, Product } from '../../models/product/product.interface';
import { APIBridge } from './models/api-bridge.interface';
import { getCategoriesChunkFromWB, WBCategory } from './models/wb/categories/wb-category.interface';
import { WBFeedbackRequest } from './models/wb/feedback/wb-feedback-request.interface';
import { WBFeedbacks } from './models/wb/feedback/wb-feedbacks.interface';
import { WBPersonRoot } from './models/wb/person/wb-person-root.interface';
import { WBProduct } from './models/wb/product/wb-product.interface';
import { WBSimilar } from './models/wb/similar/wb-similar.interface';

@Injectable({
  providedIn: 'root',
})
export class WBAPIService implements APIBridge {

  private categories$: Observable<Categories> | null = null;
  private readonly productIdToStreamMap = new Map<string, Observable<Partial<Product>>>();
  private readonly categoryIdToCatalogMap = new Map<string, Observable<Partial<Product>[]>>();
  private readonly queryToCatalogMap = new Map<string, Observable<Partial<Product>[]>>();
  private readonly productIdToFeedbacksMap = new Map<string, Observable<ProductFeedbacks>>();
  private readonly userIdToPersonMap = new Map<string, Observable<Partial<Person>>>();
  private readonly productIdToSimilarMap = new Map<string, Observable<Partial<Product>[]>>();
  private readonly maxFeedbacks = 5000; // Seems like there's a vendor hard stop on feedback size

  constructor(
    private http: HttpClient,
  ) {
  }

  getCategoriesChanges(): Observable<Categories> {
    if (this.categories$) {

      return this.categories$;
    }
    this.categories$ = this.http.get<WBCategory[]>(`${environment.host}/api/${VendorPlatform.WB}/categories`)
      .pipe(
        map((dto: WBCategory[]) => getCategoriesChunkFromWB(dto)),
        shareReplay(1),
      );

    return this.categories$;
  }

  getCatalogChanges(id?: number | string | null): Observable<Partial<Product>[]> {
    if (!id) {

      return NEVER;
    }
    const idString = `${id}`;
    const existingStream$ = this.categoryIdToCatalogMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const stream$ = this.http.get<WBSimilar>(`${environment.host}/api/${VendorPlatform.WB}/catalog/${id}`)
      .pipe(
        map((dto: WBSimilar) => mapProductsFromSimilarWB(dto)),
        shareReplay(1),
      );
    this.categoryIdToCatalogMap.set(idString, stream$);

    return stream$;
  }

  getSearchChanges(query?: string | null): Observable<Partial<Product>[]> {
    if (!query) {

      return NEVER;
    }
    const existingStream$ = this.categoryIdToCatalogMap.get(query);
    if (existingStream$) {

      return existingStream$;
    }
    const stream$ = this.http.get<WBSimilar>(`${environment.host}/api/${VendorPlatform.WB}/search/${query}`)
      .pipe(
        map((dto: WBSimilar) => mapProductsFromSimilarWB(dto)),
        shareReplay(1),
      );
    this.categoryIdToCatalogMap.set(query, stream$);

    return stream$;
  }

  getUserChanges(id?: number | string | null): Observable<Partial<Person>> {
    if (!id) {

      return NEVER;
    }
    const idString = `${id}`;
    const existingStream$ = this.userIdToPersonMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const stream$ = this.http.get<WBPersonRoot>(`${environment.host}/api/${VendorPlatform.WB}/user/${id}`)
      .pipe(
        map((person: WBPersonRoot) => getPersonFromWB(+id, person)),
        shareReplay(1),
      );
    this.userIdToPersonMap.set(idString, stream$);

    return stream$;
  }

  getProductChanges(id: number | string): Observable<Partial<Product>> {
    const idString = `${id}`;
    const existingStream$ = this.productIdToStreamMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const product$ = this.http.get<WBProduct>(`https://wbx-content-v2.wbstatic.net/ru/${id}.json`)
      .pipe(
        map((dto: WBProduct) => mapProductFromWB(dto)),
        shareReplay(1),
      );
    this.productIdToStreamMap.set(idString, product$);

    return product$;
  }

  getSimilarChanges(id: number | string): Observable<Partial<Product>[]> {
    const idString = `${id}`;
    const existingStream$ = this.productIdToSimilarMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const items$ = this.http.get<WBSimilar>(`${environment.host}/api/${VendorPlatform.WB}/product/${id}/similar`)
      .pipe(
        map((item: WBSimilar) => mapProductsFromSimilarWB(item, id)),
        shareReplay(1),
      );
    this.productIdToSimilarMap.set(idString, items$);

    return items$;
  }

  getFeedbacksChanges(
    item: Partial<ProductReference> | null | undefined,
    fetchWhile?: ((items: ProductFeedbacks) => boolean) | null,
    existingAccumulator?: ProductFeedbacks,
  ): Observable<ProductFeedbacks> {
    if (!item) {

      return NEVER;
    }
    const step = 30;
    let requestsMade = existingAccumulator?.requestsMade ?? 0;
    let progress = 12;
    const request: WBFeedbackRequest = {
      imtId: item.parentId ?? 0,
      skip: requestsMade * step,
      take: step,
    };
    const emptyFeedbacks: ProductFeedbacks = existingAccumulator ?? {
      progress,
      feedbacks: [],
      requestsMade: 0,
      size: null,
      withPhotosSize: null,
      ...(existingAccumulator ?? {}),
      hasError: false,
    };

    return of(emptyFeedbacks)
      .pipe(
        delay(Math.random() * 500),
        expand((value: ProductFeedbacks) => {
          const firstRequestMade = value.size !== null;
          const shouldFetchNext = firstRequestMade
            ? fetchWhile?.(value) ?? true
            : true;
          const limitReached = firstRequestMade && requestsMade * step >= Math.min(this.maxFeedbacks, value?.size ?? 0);
          if (limitReached || !shouldFetchNext || value.hasError) {

            return EMPTY;
          }
          if (firstRequestMade) {
            requestsMade++;
            request.skip += request.take;
            progress = Math.max(12, Math.min(100, 100 * (requestsMade * step) / Math.min(this.maxFeedbacks, value?.size ?? 0)));
          }
          if (request.skip >= this.maxFeedbacks) {

            return EMPTY;
          }

          return this.getFeedbackChanges(item.id, request, progress, requestsMade)
            .pipe(
              map((items: ProductFeedbacks) => mergeProductFeedbacks(value, items)),
              delay(Math.random() * 500),
            );
        }),
        shareReplay(1),
      );
  }

  private getFeedbackChanges(
    itemId: number | undefined,
    request: WBFeedbackRequest,
    progressBeforeRequest: number,
    requestsMade: number,
  ): Observable<ProductFeedbacks> {
    const idString = `${itemId}~~${request.skip}..${request.take}`;
    const existingStream$ = this.productIdToFeedbacksMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const stream$ = this.http.post<WBFeedbacks>(`${environment.host}/api/${VendorPlatform.WB}/feedback`, request)
      .pipe(
        map((item: WBFeedbacks) => {
          const progress = item.feedbackCount < request.take || request.skip + request.take > this.maxFeedbacks
            ? 100
            : progressBeforeRequest;
          const feedbacks = getProductFeedbacksFromWB(itemId, progress, requestsMade, item);

          return feedbacks;
        }),
        catchError(() => {
          this.productIdToFeedbacksMap.delete(idString);

          return of(getErrorProductFeedback(requestsMade, progressBeforeRequest));
        }),
        shareReplay(1),
      );
    this.productIdToFeedbacksMap.set(idString, stream$);

    return stream$;
  }
}
