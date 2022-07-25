import { Routes } from '@angular/router';
import { PersonComponent } from './pages/person/person.component';
import { ProductComponent } from './pages/product/product.component';

const COMMON_ROUTES: Routes = [
  {
    path: 'product/:id',
    component: ProductComponent,
  },
  {
    path: 'person/:id',
    component: PersonComponent,
  },
]

export const APP_ROUTES: Routes = [
  ...COMMON_ROUTES,
  {
    path: ':platform',
    children: COMMON_ROUTES,
  }
];
