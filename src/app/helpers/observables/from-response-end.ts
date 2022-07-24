import { Request } from 'express';
import { Observable, Subscriber } from 'rxjs';

export function fromResponseEnd(request: Request): Observable<void> {
  return new Observable((subscriber: Subscriber<void>) => {
    let callbackCalled = false;
    const eventCallback = () => {
      if (!callbackCalled) {
        subscriber.next();
      }
      callbackCalled = true;
    };

    request.on('close', eventCallback);
    request.on('finish', eventCallback);
  });
}
