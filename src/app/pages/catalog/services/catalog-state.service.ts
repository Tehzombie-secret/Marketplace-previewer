import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Product } from '../../../models/product/product.interface';
import { APIService } from '../../../services/api/api.service';
import { CatalogViewModel } from '../models/catalog-view-model.interface';

@Injectable({
  providedIn: 'root',
})
export class CatalogStateService implements OnDestroy {

  private readonly state$ = new BehaviorSubject<CatalogViewModel>({
    canFetch: false,
    hasError: false,
    isLoading: true,
    items: [],
  });
  private subs$ = new Subscription();
  private lastType: 'c' | 's' | null = null;
  private lastId: string | null = null;
  private page: number | undefined = undefined;

  constructor(
    private API: APIService,
  ) {
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  getLength(): number {
    return this.state$.getValue().items.length;
  }

  getStateChanges(): Observable<CatalogViewModel> {
    return this.state$.asObservable();
  }

  nextPage(): void {
    this.page = this.page ? this.page + 1 : 2;
    if (this.lastId !== null && this.lastType !== null) {
      this.request(this.lastType, this.lastId, this.page);
    }
  }

  catalog(id: string): void {
    this.page = undefined;
    this.request('c', id);
  }

  search(query: string): void {
    this.page = undefined;
    this.request('s', query);
  }

  retry(): void {
    if (this.lastId !== null && this.lastType !== null) {
      this.request(this.lastType, this.lastId, this.page);
    }
  }

  private request(type: 'c' | 's', id: string, page?: number): void {
    this.unsubscribe();
    this.lastId = id;
    this.lastType = type;
    const shouldConcat = Boolean(page);
    const currentState = this.state$.getValue();
    this.state$.next({
      canFetch: currentState.canFetch,
      hasError: currentState.hasError,
      isLoading: true,
      items: shouldConcat ? currentState.items : [],
    });
    const fetch$ = type === 'c'
      ? this.API.getCatalogChanges(id, page)
      : this.API.getSearchChanges(id, page);
    const sub$ = fetch$.subscribe({
      next: (result: Partial<Product>[]) => {
        const items = shouldConcat
          ? this.state$.getValue().items.concat(result || [])
          : (result || []);
        const state: CatalogViewModel = {
          items,
          canFetch: result.length > 0,
          hasError: false,
          isLoading: false,
        };
        this.state$.next(state);
      },
      error: () => {
        const state: CatalogViewModel = {
          canFetch: false,
          hasError: true,
          isLoading: false,
          items: this.state$.getValue().items,
        };
        this.state$.next(state);
      }
    });
    this.subs$.add(sub$);
  }

  private unsubscribe(): void {
    this.subs$.unsubscribe();
    this.subs$ = new Subscription();
  }

}
