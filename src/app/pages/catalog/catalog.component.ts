import { trigger, transition, style, animate } from '@angular/animations';
import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Product } from '../../models/product/product.interface';
import { APIService } from '../../services/api/api.service';
import { CatalogViewModel } from './models/catalog-view-model.interface';

@Component({
  standalone: true,
  selector: 'wb-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    AsyncPipe,
    RouterModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    ProductCardComponent,
  ],
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('200ms ease-out', style({ opacity: 0, transform: 'scale(1.05)' })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('220ms ease-in', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class CatalogComponent {

  private readonly retry$ = new BehaviorSubject<void>(void 0);
  readonly page$ = this.getCatalogChanges(this.retry$);

  constructor(
    private API: APIService,
    private route: ActivatedRoute,
  ) {
  }

  retry(): void {
    this.retry$.next();
  }

  private getCatalogChanges(retry$: Observable<void>): Observable<CatalogViewModel> {
    const errorResponse: CatalogViewModel = {
      hasError: true,
      isLoading: false,
      items: [],
    };
    const isLoadingResponse: CatalogViewModel = {
      hasError: false,
      isLoading: true,
      items: [],
    };
    const emptyResponse: CatalogViewModel = {
      hasError: false,
      isLoading: false,
      items: [],
    };

    return retry$
      .pipe(
        switchMap(() => this.route.paramMap),
        map((paramMap: ParamMap) => paramMap.get('id')),
        switchMap((id: string | null) => id
          ? this.API.getCatalogChanges(id)
            .pipe(
              map((items: Partial<Product>[]) => {
                const viewModel: CatalogViewModel = {
                  items,
                  isLoading: false,
                  hasError: false,
                };

                return viewModel;
              }),
              startWith(isLoadingResponse),
            )
          : of(emptyResponse)
        ),
        catchError(() => of(errorResponse)),
      );
  }

}
