import { Injectable } from '@angular/core';
import { ParamMap, Router } from '@angular/router';
import { map, NEVER, Observable, switchMap, tap } from 'rxjs';
import { valueIsInEnum } from '../../helpers/value-is-in-enum';
import { Categories } from '../../models/categories/categories.interface';
import { ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { UserFeedback } from '../../models/feedbacks/user-feedback.interface';
import { Person } from '../../models/person/person.interface';
import { ProductReference } from '../../models/product/product-reference.interface';
import { Product } from '../../models/product/product.interface';
import { EtsyAPIService } from './etsy-api.service';
import { APIBridge } from './models/api-bridge.interface';
import { APIPlatform } from './models/api-platform.enum';
import { FeedbackHint } from './models/feedback-hint.interface';
import { WBAPIService } from './wb-api.service';

@Injectable({
  providedIn: 'root',
})
export class APIService implements APIBridge {

  constructor(
    private router: Router,
    private WBAPI: WBAPIService,
    private etsyAPI: EtsyAPIService,
  ) {
  }

  getCategoriesChanges(): Observable<Categories> {
    return this.request((service: APIBridge) => service.getCategoriesChanges());
  }

  getCatalogChanges(id?: number | string | null, page?: number | null): Observable<Partial<Product>[]> {
    return this.request((service: APIBridge) => service.getCatalogChanges(id, page));
  }

  getSearchChanges(query?: string | null, page?: number | null): Observable<Partial<Product>[]> {
    return this.request((service: APIBridge) => service.getSearchChanges(query, page));
  }

  getUserChanges(id?: number | string | null, hint?: FeedbackHint): Observable<Partial<Person>> {
    return this.request((service: APIBridge) => service.getUserChanges(id, hint));
  }

  getProductChanges(id: number | string): Observable<Partial<Product>> {
    return this.request((service: APIBridge) => service.getProductChanges(id));
  }

  getSimilarChanges(id: number | string): Observable<Partial<Product>[]> {
    return this.request((service: APIBridge) => service.getSimilarChanges(id));
  }

  getFeedbackSearchChanges(query?: string | null, page?: string | number | null): Observable<Partial<UserFeedback>[]> {
    return this.request((service: APIBridge) => service.getFeedbackSearchChanges(query, page));
  }

  getFeedbacksChanges(
    item: Partial<ProductReference> | null | undefined,
    noPhotos: boolean,
    videosOnly: boolean,
    fetchWhile?: ((items: ProductFeedbacks) => boolean) | null,
    existingAccumulator?: ProductFeedbacks,
  ): Observable<ProductFeedbacks> {
    return this.request((service: APIBridge) => service.getFeedbacksChanges(item, noPhotos, videosOnly, fetchWhile, existingAccumulator));
  }

  private request<T>(fn: (service: APIBridge) => Observable<T>): Observable<T> {
    const strategy: Record<APIPlatform, APIBridge> = {
      [APIPlatform.WB]: this.WBAPI,
      [APIPlatform.ETSY]: this.etsyAPI,
    };

    return (this.router.routerState.root.firstChild?.paramMap ?? NEVER)
      .pipe(
        map((paramMap: ParamMap) => paramMap.get('platform')),
        tap((value: string | null) => {
          if (!valueIsInEnum(APIPlatform, value)) {
            let newURL = `/${APIPlatform.WB}${this.router.url}`;
            newURL = newURL.endsWith('/')
              ? newURL.substring(0, newURL.length - 1)
              : newURL;
            this.router.navigateByUrl(newURL);
          }
        }),
        map((platform: string | null) => strategy[platform as APIPlatform ?? APIPlatform.WB] ?? this.WBAPI),
        switchMap((service: APIBridge) => fn(service)),
      )
  }
}
