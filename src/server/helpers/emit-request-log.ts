import { Request, Response } from 'express';
import { throwError } from 'rxjs';
import { take, timeout } from 'rxjs/operators';
import { cyanText } from '../../app/helpers/ansi/cyan-text';
import { greenText } from '../../app/helpers/ansi/green-text';
import { yellowText } from '../../app/helpers/ansi/yellow-text';
import { emitErrorLog } from '../../app/helpers/emit-error-log/emit-error-log';
import { ErrorReason } from '../../app/helpers/emit-error-log/models/error-reason.enum';
import { fromResponseEnd } from '../../app/helpers/observables/from-response-end';
import { LogType } from '../../app/models/log-type.enum';
import { environment } from '../../environments/environment';
import { deltaFor } from './delta-for';
import { getPreciseTime } from './get-precise-time';

/**
 * Logs single request metadata, should be called
 * right before sending response to client, so we
 * can calculate response serve time.
 *
 * Be adviced that this function won't fire immediately
 * since it waits till response is fully served.
 */
export function emitRequestLog(request: Request, response: Response): void {
  const serveStart = getPreciseTime();

  fromResponseEnd(request)
    .pipe(
      take(1),
      timeout({
        each: 35_000,
        with: () => throwError(() => new Error()),
      }),
    )
    .subscribe({
      next: () => {
        const url = request.originalUrl;
        const useragent = request.get('user-agent') ?? 'unknown';
        const serveTime = deltaFor(serveStart);

        if (environment.jsonLogs) {
          console.log(JSON.stringify({
            type: LogType.REQUEST,
            url,
            method: request.method,
            host: request.hostname,
            useragent,
            serveTime,
            statusCode: response.statusCode,
            remoteAddress: request.get('X-Forwarded-For') ?? 'unknown', // AWS ELB uses this header to pass IP
            referrer: request.get('referrer') ?? 'unknown',
          }));
        } else {
          const status = response.statusCode === 200
            ? greenText(200)
            : yellowText(response.statusCode);
          console.log(`Served ${cyanText(url)} for ${serveTime}ms, status ${status} useragent ${cyanText(useragent)}`);
        }
      },

      error: () => {
        emitErrorLog(ErrorReason.EXPRESS, `${request.originalUrl} serve timeout`);
      },
    });
}
