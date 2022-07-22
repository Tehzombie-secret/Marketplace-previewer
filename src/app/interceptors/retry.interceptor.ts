import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry, throwError, timer } from 'rxjs';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {

  private readonly retryDelay = [120, 190, 250, 800, 1200, 3500];

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {

      return next.handle(request);
    }

    return next.handle(request)
      .pipe(
        retry({
          count: 4,
          delay: (error: HttpErrorResponse, retryCount: number) => {
            const delay = this.retryDelay[retryCount];
            if (!delay) {

              return throwError(error);
            }

            return timer(delay);
          },
          resetOnSuccess: true,
        }),
      );
  }

}
