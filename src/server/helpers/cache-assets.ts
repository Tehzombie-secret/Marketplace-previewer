import { relative } from 'path';
import { forkJoin, of, throwError } from 'rxjs';
import { finalize, mergeMap, timeout } from 'rxjs/operators';
import { emitErrorLog } from '../../app/helpers/emit-error-log/emit-error-log';
import { ErrorReason } from '../../app/helpers/emit-error-log/models/error-reason.enum';
import { emitInfoLog } from '../../app/helpers/emit-log';
import { TimeoutException } from '../models/timeout/timeout-exception';
import { TimeoutReason } from '../models/timeout/timeout-reason.enum';
import { AssetMemCacheService } from '../services/asset-mem-cache.service';
import { getBinaryFileChanges } from './observables/get-binary-file-changes';
import { getBrotliContentChanges } from './observables/get-brotli-file-changes';
import { getFilePathChanges } from './observables/get-file-path-changes';

let assetsCached = false;

export async function cacheAssets(
  assetsFolder: string,
  memoryCache: AssetMemCacheService,
): Promise<void> {
  if (assetsCached) {
    return;
  }
  assetsCached = true;
  return new Promise<void>((resolve) => {
    getFilePathChanges(assetsFolder, true)
      .pipe(
        mergeMap((filePath: string) => getBinaryFileChanges(filePath)
          .pipe(
            mergeMap((fileBuffer: Buffer) => forkJoin([
              // Extract relative path ("/img/1.jpg") from absolute paths
              // ("C:/project/dist/browser/assets/img/1.jpg")
              of(relativeOf(assetsFolder, filePath)),
              of(fileBuffer),
              getBrotliContentChanges(fileBuffer, filePath.endsWith('.woff2')),
            ])),
          ),
        ),
        timeout({ each: 25_000, with: () => throwError(() => new TimeoutException(TimeoutReason.STATIC_ASSETS)) }),
        finalize(() => {
          resolve();
          emitInfoLog('Static assets cached');
        }),
      )
      .subscribe({
        next: ([filePath, content, brotliContent]: [string, Buffer, Buffer]) => {
          memoryCache.set(filePath, content, brotliContent);
        },
        error: (error: TimeoutException | Error) => {
          emitErrorLog(ErrorReason.EXPRESS, error, `Asset cache enrichment failure`);
        },
      });
  });
}

function relativeOf(browserPath: string, filePath: string): string {
  const relativePath = relative(browserPath, filePath)?.replace(/\\/g, '/');
  const result = relativePath.startsWith('/')
    ? relativePath
    : `/${relativePath}`;

  return result;
}
