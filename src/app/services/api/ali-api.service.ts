import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, delay, EMPTY, expand, map, NEVER, Observable, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VendorPlatform } from '../../../server/models/image-platform.enum';
import { Categories } from '../../models/categories/categories.interface';
import { getErrorProductFeedback, mergeProductFeedbacks, ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { Person } from '../../models/person/person.interface';
import { ProductReference } from '../../models/product/product-reference.interface';
import { Product } from '../../models/product/product.interface';
import { AliCatalogEntry, mapProductsFromCatalogAli } from './models/ali/catalog/ali-catalog-entry.interface';
import { AliCatalogProduct } from './models/ali/catalog/ali-catalog-product.interface';
import { AliCategories, getCategoriesChunkFromAli } from './models/ali/category/ali-categories.interface';
import { AliFeedbackRequest } from './models/ali/feedback/ali-feedback-request.interface';
import { AliFeedbackResponse, getProductFeedbacksFromAli } from './models/ali/feedback/ali-feedback-response.interface';
import { AliProduct, getProductFromAli } from './models/ali/product/ali-product.interface';
import { APIBridge } from './models/api-bridge.interface';

@Injectable({
  providedIn: 'root',
})
export class AliAPIService implements APIBridge {

  private categories$: Observable<Categories> | null = null;
  private readonly categoryIdToCatalogMap = new Map<string, Observable<Partial<Product>[]>>();
  private readonly queryToCatalogMap = new Map<string, Observable<Partial<Product>[]>>();
  private readonly productIdToFeedbacksMap = new Map<string, Observable<ProductFeedbacks>>();
  private readonly productIdToStreamMap = new Map<string, Observable<Partial<Product>>>();
  private readonly userIdToPersonMap = new Map<string, Observable<Partial<Person>>>();
  private readonly productIdToSimilarMap = new Map<string, Observable<Partial<Product>[]>>();

  constructor(
    private router: Router,
    private location: Location,
    private http: HttpClient,
  ) {
  }

  getCategoriesChanges(): Observable<Categories> {
    if (this.categories$) {

      return this.categories$;
    }
    this.categories$ = this.http.post<AliCategories>('https://aliexpress.ru/aer-api/v2/v1/bx/categories/1', null)
      .pipe(
        map((categories: AliCategories) => getCategoriesChunkFromAli(categories)),
        shareReplay(1),
      );

    return this.categories$;
  }

  getCatalogChanges(id?: string | number | null, page?: number | null): Observable<Partial<Product>[]> {
    if (!page) {
      page = 1;
    }
    const key = `${id}-${page}`;
    const existingStream$ = this.categoryIdToCatalogMap.get(key);
    if (existingStream$) {

      return existingStream$;
    }
    const body = {
      page,
      catId: id,
      searchInfo: 'isFacets:false',
    };
    const stream$ = this.http.post<{ data: AliCatalogEntry }>('https://aliexpress.ru/aer-webapi/v1/search', body)
      .pipe(
        map((item: { data: AliCatalogEntry }) => mapProductsFromCatalogAli(item?.data)),
        shareReplay(1),
      );
    this.categoryIdToCatalogMap.set(key, stream$);

    return stream$;
  }

  getSearchChanges(query?: string | null, page?: number | null): Observable<Partial<Product>[]> {
    if (!page) {
      page = 1;
    }
    const key = `${query}-${page}`;
    const existingStream$ = this.queryToCatalogMap.get(key);
    if (existingStream$) {

      return existingStream$;
    }
    const body = {
      searchText: query,
      page: page ?? 1,
      searchInfo: 'isFacets:false',
    };
    const stream$ = this.http.post<{ data: AliCatalogEntry }>('https://aliexpress.ru/aer-webapi/v1/search', body)
      .pipe(
        map((item: { data: AliCatalogEntry }) => mapProductsFromCatalogAli(item?.data)),
        shareReplay(1),
      );
    this.queryToCatalogMap.set(key, stream$);

    return stream$;
  }

  getUserChanges(id?: string | number | null): Observable<Partial<Person>> {
    throw new Error('Method not implemented.');
  }

  getProductChanges(id: string | number): Observable<Partial<Product>> {
    const sku = this.location.path(false)
      .split('?')?.[1]
      ?.split('&')
      ?.find((str: string) => str.startsWith('skuId'))
      ?.split('=')?.[1];
    const key = `${id}`;
    const existingStream$ = this.productIdToStreamMap.get(key);
    if (existingStream$) {

      return existingStream$;
    }
    const stream$ = this.http.get<AliProduct>(`${environment.host}/api/${VendorPlatform.ALI}/product/${id}/${sku}`)
      .pipe(
        map((product: AliProduct) => getProductFromAli(product)),
        shareReplay(1),
      );
    this.productIdToStreamMap.set(key, stream$);

    return stream$;
  }

  getSimilarChanges(id: string | number): Observable<Partial<Product>[]> {
    throw new Error('Method not implemented.');
  }

  getFeedbacksChanges(
    item?: Partial<ProductReference> | null,
    fetchWhile?: ((items: ProductFeedbacks) => boolean) | null,
    existingAccumulator?: ProductFeedbacks,
  ): Observable<ProductFeedbacks> {
    if (!item) {

      return NEVER;
    }
    const step = 10;
    let requestsMade = existingAccumulator?.requestsMade ?? 0;
    let page = 1;
    let progress = 12;
    const payload: AliFeedbackRequest = {
      local: false,
      page,
      pageSize: step,
      productId: `${item?.id}`,
      sort: 'default',
      starFilter: 'all',
      translate: true,
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
    emptyFeedbacks.hasError = false;

    return of(emptyFeedbacks)
      .pipe(
        delay(Math.random() * 500),
        expand((value: ProductFeedbacks) => {
          const firstRequestMade = value.size !== null;
          const shouldFetchNext = firstRequestMade
            ? fetchWhile?.(value) ?? true
            : true;
          if (!shouldFetchNext || value.hasError) {

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

          return this.getFeedbackChanges(item.id, payload, progress, requestsMade)
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
    request: AliFeedbackRequest,
    progressBeforeRequest: number,
    requestsMade: number,
  ): Observable<ProductFeedbacks> {
    const idString = `${itemId}~~${request.page}..${request.pageSize}`;
    const existingStream$ = this.productIdToFeedbacksMap.get(idString);
    if (existingStream$) {

      return existingStream$;
    }
    const url = `https://aliexpress.ru/aer-api/v1/review/filters?product_id=${request.productId}`;
    const stream$ = this.http.post<AliFeedbackResponse>(url, request)
      .pipe(
        map((item: AliFeedbackResponse) => {
          const progress = item.feedbackCount < request.take || request.skip + request.take > this.maxFeedbacks
            ? 100
            : progressBeforeRequest;
          const feedbacks = getProductFeedbacksFromAli(`${itemId}`, progress, requestsMade, item);

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
