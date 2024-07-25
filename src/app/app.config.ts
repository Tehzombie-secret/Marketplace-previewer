import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES, withEnabledBlockingInitialNavigation()),
    {
        provide: MAT_DIALOG_DEFAULT_OPTIONS,
        useValue: {
            panelClass: 'wb-dialog-container',
        },
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: TimeoutInterceptor,
        multi: true,
    },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimations(),
  ]
};
