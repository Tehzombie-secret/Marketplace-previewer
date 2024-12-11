import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, map, NEVER, Observable, of } from 'rxjs';
import { catchError, delay, expand, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VendorPlatform } from '../../../server/models/image-platform.enum';
import { Categories } from '../../models/categories/categories.interface';
import { getErrorProductFeedback, getProductFeedbacksFromWBV2, mergeProductFeedbacks, ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { UserFeedback } from '../../models/feedbacks/user-feedback.interface';
import { Person } from '../../models/person/person.interface';
import { ProductReference } from '../../models/product/product-reference.interface';
import { mapProductFromWB, mapProductsFromSimilarWB, Product } from '../../models/product/product.interface';
import { APIBridge } from './models/api-bridge.interface';
import { FeedbackHint } from './models/feedback-hint.interface';
import { getCategoriesChunkFromWB, WBCategory } from './models/wb/categories/wb-category.interface';
import { WBFeedbackRequest } from './models/wb/feedback/v1/wb-feedback-request.interface';
import { WBFeedbacksV2 } from './models/wb/feedback/v2/wb-feedbacks-v2.interface';
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
  private readonly maxFeedbacks = 500; // Seems like there's a vendor hard stop on feedback size

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

  getCatalogChanges(id?: number | string | null, page?: number | null): Observable<Partial<Product>[]> {
    if (!id) {

      return NEVER;
    }
    const idString = `${id}~~~${page}`;
    const existingStream$ = this.categoryIdToCatalogMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const params = {
      ...(page ? { page } : {}),
    };
    const stream$ = this.http.get<WBSimilar>(`${environment.host}/api/${VendorPlatform.WB}/catalog/${id}`, { params })
      .pipe(
        map((dto: WBSimilar) => mapProductsFromSimilarWB(dto)),
        shareReplay(1),
      );
    this.categoryIdToCatalogMap.set(idString, stream$);

    return stream$;
  }

  getSearchChanges(query?: string | null, page?: number | null): Observable<Partial<Product>[]> {
    if (!query) {

      return NEVER;
    }
    const idString = `${query}~~~${page}`;
    const existingStream$ = this.queryToCatalogMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const params = {
      ...(page ? { page } : {}),
    };
    const stream$ = this.http.get<WBSimilar>(`${environment.host}/api/${VendorPlatform.WB}/search/${query}`, { params })
      .pipe(
        map((dto: WBSimilar) => mapProductsFromSimilarWB(dto)),
        shareReplay(1),
      );
    this.queryToCatalogMap.set(idString, stream$);

    return stream$;
  }

  getUserChanges(id?: number | string | null, hint?: FeedbackHint): Observable<Partial<Person>> {
    if (!id) {

      return NEVER;
    }
    const idString = `${id}`;
    const existingStream$ = this.userIdToPersonMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const stream$ = this.http.get<Partial<Person>>(`${environment.host}/api/${VendorPlatform.WB}/user/${id}`, {
      params: typeof hint?.useGlobalId === 'boolean' ? { global: hint?.useGlobalId } : {},
    })
      .pipe(
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
    const product$ = this.http.get<WBProduct>(`${environment.host}/api/${VendorPlatform.WB}/v1/product/${id}`)
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

  getFeedbackSearchChanges(query?: string | null, page?: string | number | null): Observable<Partial<UserFeedback>[]> {
    const url = `${environment.host}/api/${VendorPlatform.WB}/v1/feedback/search`;
    const params = {
      ...(query ? { query } : {}),
      ...(page ? { page } : { page: 1 }),
    };
    return this.http.get<Partial<UserFeedback>[]>(url, { params });
  }

  getFeedbacksChanges(
    item: Partial<ProductReference> | null | undefined,
    noPhotos: boolean,
    videosOnly: boolean,
    fetchWhile?: ((items: ProductFeedbacks) => boolean) | null,
    existingAccumulator?: ProductFeedbacks,
  ): Observable<ProductFeedbacks> {
    return this.getFeedbackChangesV2(item, noPhotos, videosOnly);
  }

  private getFeedbackChangesV2(item: Partial<ProductReference> | null | undefined, noPhotos: boolean, videosOnly: boolean): Observable<ProductFeedbacks> {
    const params = {
      ...(item?.parentId ? { imtId: item?.parentId } : {}),
      ...(item?.id ? { nmId: item?.id } : {}),
      ...(noPhotos ? { noPhotos } : {}),
      ...(videosOnly ? { videosOnly } : {}),
    };
    const key = `${params.imtId}~~~${params.nmId}~~${noPhotos}~~${videosOnly}`;
    const existingStream$ = this.productIdToFeedbacksMap.get(key);
    if (existingStream$) {

      return existingStream$;
    }
    const stream$ = this.http.get<WBFeedbacksV2>(`${environment.host}/api/${VendorPlatform.WB}/v2/feedback`, { params })
      .pipe(
        map((item: WBFeedbacksV2) => {
          const feedbacks = getProductFeedbacksFromWBV2(params.imtId, noPhotos, videosOnly, item);

          return feedbacks;
        }),
        catchError(() => {
          this.productIdToFeedbacksMap.delete(key);

          return of(getErrorProductFeedback(1, 0));
        }),
        shareReplay(1),
      );
    this.productIdToFeedbacksMap.set(key, stream$);

    return stream$;
  }

  private getFeedbacksChangesV1(
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
      imtId: +(item.parentId || 0),
      skip: requestsMade * step,
      take: step,
    };
    const emptyFeedbacks: ProductFeedbacks = existingAccumulator ?? {
      progress,
      feedbacks: [],
      requestsMade: 0,
      size: null,
      withPhotosSize: null,
      withVideoSize: null,
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
    itemId: string | number | undefined,
    request: WBFeedbackRequest,
    progressBeforeRequest: number,
    requestsMade: number,
  ): Observable<ProductFeedbacks> {
    const idString = `${itemId}~~${request.skip}..${request.take}`;
    const existingStream$ = this.productIdToFeedbacksMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const stream$ = this.http.post<WBFeedbacksV2>(`${environment.host}/api/${VendorPlatform.WB}/feedback`, request)
      .pipe(
        map((item: WBFeedbacksV2) => {
          const feedbacks = getProductFeedbacksFromWBV2(itemId, false, false, item);

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
