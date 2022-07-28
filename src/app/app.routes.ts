import { Routes } from '@angular/router';

const COMMON_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/categories/categories.component').then(c => c.CategoriesComponent),
  },
  {
    path: 'catalog/:id',
    loadComponent: () => import('./pages/catalog/catalog.component').then(c => c.CatalogComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product/product.component').then(c => c.ProductComponent),
  },
  {
    path: 'person/:id',
    loadComponent: () => import('./pages/person/person.component').then(c => c.PersonComponent),
  },
];

export const APP_ROUTES: Routes = [
  ...COMMON_ROUTES,
  {
    path: ':platform',
    children: COMMON_ROUTES,
  }
];
