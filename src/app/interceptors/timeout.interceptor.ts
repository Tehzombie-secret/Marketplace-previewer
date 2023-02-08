import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError, timeout } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

  private readonly slowConnections = ['slow-2g', '2g', '3g'];
  private readonly navigator = this.document.defaultView?.navigator;

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) {
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        timeout({
          each: this.slowConnections.includes((this.navigator as any)?.connection?.effectiveType?.toLowerCase?.())
            ? 45_000
            : 25_000,
          with: () => throwError(() => new HttpErrorResponse({
            error: `Intercepted with timeout for ${request.urlWithParams}`,
            url: request.urlWithParams,
            statusText: 'Gateway Timeout',
            status: 504,
          })),
        }),
      );
  }

}
