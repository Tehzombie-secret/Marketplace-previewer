import { Observable, Subscriber } from 'rxjs';
import * as zlib from 'zlib';

/** Emits base64 brotli-encoded string of specified content */
export function getBrotliContentChanges(content: Buffer, isWoff2 = false, quality = zlib.constants.BROTLI_MAX_QUALITY): Observable<Buffer> {
  return new Observable<Buffer>((subscriber: Subscriber<Buffer>) => {
    const brotliParams: zlib.BrotliOptions = {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: quality,
        [zlib.constants.BROTLI_PARAM_MODE]: isWoff2
          ? zlib.constants.BROTLI_MODE_FONT
          : zlib.constants.BROTLI_MODE_TEXT,
      },
    };

    zlib.brotliCompress(content, brotliParams, (error: Error | null, result: Buffer) => {
      if (error) {
        subscriber.error(error);
      } else {
        subscriber.next(result);
      }
      subscriber.complete();
    });
  });
}
