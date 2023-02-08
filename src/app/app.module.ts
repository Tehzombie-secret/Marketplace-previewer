import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MAT_LEGACY_DIALOG_DEFAULT_OPTIONS as MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/legacy-dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';
import { AppShellComponent } from './components/app-shell/app-shell.component';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    AppShellComponent,
    BrowserAnimationsModule,
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
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
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
