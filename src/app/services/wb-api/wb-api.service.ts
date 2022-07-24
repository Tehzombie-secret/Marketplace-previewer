import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, map, NEVER, Observable, of } from 'rxjs';
import { catchError, delay, expand, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VendorPlatform } from '../../../server/models/image-platform.enum';
import { getErrorProductFeedback, getProductFeedbacks, mergeProductFeedbacks, ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { getPerson, Person } from '../../models/person/person.interface';
import { ProductReference } from '../../models/product/product-reference.interface';
import { mapProduct, mapProductFromSimilar, Product } from '../../models/product/product.interface';
import { WBFeedbackRequest } from './models/feedback/wb-feedback-request.interface';
import { WBFeedbacks } from './models/feedback/wb-feedbacks.interface';
import { WBPersonRoot } from './models/person/wb-person-root.interface';
import { WBProduct } from './models/product/wb-product.interface';
import { WBSimilarProduct } from './models/similar/wb-similar-product.interface';
import { WBSimilar } from './models/similar/wb-similar.interface';

@Injectable({
  providedIn: 'root',
})
export class WBAPIService {

  private readonly productIdToStreamMap = new Map<string, Observable<Partial<Product>>>();
  private readonly productIdToFeedbacksMap = new Map<string, Observable<ProductFeedbacks>>();
  private readonly userIdToPersonMap = new Map<string, Observable<Partial<Person>>>();
  private readonly productIdToSimilarMap = new Map<string, Observable<Partial<Product>[]>>();
  private readonly maxFeedbacks = 5000; // Seems like there's a vendor hard stop on feedback size

  constructor(
    private http: HttpClient,
  ) {
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
        map((person: WBPersonRoot) => getPerson(+id, person)),
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
        map((dto: WBProduct) => mapProduct(dto)),
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
        map((item: WBSimilar) => {
          const idList = new Set<number>();
          const items: Partial<Product>[] = [];
          (item?.data?.products ?? []).forEach((dto: WBSimilarProduct) => {
            const product = mapProductFromSimilar(dto);
            if (`${product.id}` === `${id}`) {

              return;
            }
            if (!product.parentId || idList.has(product.parentId)) {

              return;
            }
            items.push(product);
            idList.add(product.parentId);
          });

          return items;
        }),
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
          const feedbacks = getProductFeedbacks(itemId, progress, requestsMade, item);

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
