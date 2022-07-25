import { Injectable } from '@angular/core';
import { ParamMap, Router } from '@angular/router';
import { map, NEVER, Observable, switchMap } from 'rxjs';
import { ProductFeedbacks } from '../../models/feedbacks/product-feedbacks.interface';
import { Person } from '../../models/person/person.interface';
import { ProductReference } from '../../models/product/product-reference.interface';
import { Product } from '../../models/product/product.interface';
import { APIBridge } from './models/api-bridge.interface';
import { APIPlatform } from './models/api-platform.enum';
import { WBAPIService } from './wb-api.service';

@Injectable({
  providedIn: 'root',
})
export class APIService implements APIBridge {

  constructor(
    private router: Router,
    private WBAPI: WBAPIService,
  ) {
  }

  getUserChanges(id?: number | string | null): Observable<Partial<Person>> {
    return this.getPlatformChanges()
      .pipe(
        switchMap((service: APIBridge) => service.getUserChanges(id)),
      );
  }

  getProductChanges(id: number | string): Observable<Partial<Product>> {
    return this.getPlatformChanges()
      .pipe(
        switchMap((service: APIBridge) => service.getProductChanges(id)),
      );
  }

  getSimilarChanges(id: number | string): Observable<Partial<Product>[]> {
    return this.getPlatformChanges()
      .pipe(
        switchMap((service: APIBridge) => service.getSimilarChanges(id)),
      );
  }

  getFeedbacksChanges(
    item: Partial<ProductReference> | null | undefined,
    fetchWhile?: ((items: ProductFeedbacks) => boolean) | null,
    existingAccumulator?: ProductFeedbacks,
  ): Observable<ProductFeedbacks> {
    return this.getPlatformChanges()
      .pipe(
        switchMap((service: APIBridge) => service.getFeedbacksChanges(item, fetchWhile, existingAccumulator)),
      );
  }

  private getPlatformChanges(): Observable<APIBridge> {
    const strategy: Record<APIPlatform, APIBridge> = {
      [APIPlatform.WB]: this.WBAPI,
    };

    return (this.router.routerState.root.firstChild?.paramMap ?? NEVER)
      .pipe(
        map((paramMap: ParamMap) => strategy[paramMap.get('platform') as APIPlatform ?? APIPlatform.WB] ?? this.WBAPI),
      )
  }
}
