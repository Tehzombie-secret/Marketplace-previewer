import { Routes } from '@angular/router';
import { ROUTE_PATH } from './constants/route-path.const';
import { PlatformPickerComponent } from './pages/platform-picker/platform-picker.component';

const COMMON_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/categories/categories.component').then(c => c.CategoriesComponent),
  },
  {
    path: `${ROUTE_PATH.CATALOG}/:id`,
    loadComponent: () => import('./pages/catalog/catalog.component').then(c => c.CatalogComponent),
  },
  {
    path: `${ROUTE_PATH.CATALOG}`,
    loadComponent: () => import('./pages/catalog/catalog.component').then(c => c.CatalogComponent),
  },
  {
    path: `${ROUTE_PATH.PRODUCT}/:id`,
    loadComponent: () => import('./pages/product/product.component').then(c => c.ProductComponent),
  },
  {
    path: `${ROUTE_PATH.PERSON}/:id`,
    loadComponent: () => import('./pages/person/person.component').then(c => c.PersonComponent),
  },
  {
    path: `${ROUTE_PATH.SEARCH_FEEDBACKS}`,
    loadComponent: () => import('./pages/feedback-search/feedback-search.component').then(c => c.FeedbackSearchComponent),
  },
];

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent),
  },
  {
    path: ROUTE_PATH.HISTORY,
    loadComponent: () => import('./pages/history/history.component').then(c => c.HistoryComponent),
  },
  {
    path: ROUTE_PATH.FAQ,
    loadComponent: () => import('./pages/faq/faq.component').then(c => c.FAQComponent),
  },
  ...COMMON_ROUTES,
  {
    path: ':platform',
    component: PlatformPickerComponent,
    children: COMMON_ROUTES,
  }
];
