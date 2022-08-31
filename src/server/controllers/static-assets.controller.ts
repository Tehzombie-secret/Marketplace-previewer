import { addMinutes, format } from 'date-fns';
import { Handler, NextFunction, Request, Response } from 'express';
import { getType } from 'mime';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';
import { getBinaryFileChanges } from '../helpers/observables/get-binary-file-changes';
import { AssetChunk } from '../models/asset-chunk.interface';
import { ServerContext } from '../models/server-context.interface';

/**
 * Provides controller for static resources and assets located on file system
 */
 export function staticAssetsController(context: ServerContext): Handler {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const acceptEncoding = request.header('Accept-Encoding') || '';
    const useBrotli = acceptEncoding.includes('br') || acceptEncoding.includes('*');
    const contentType = getType(request.url) ?? 'text/plain';
    console.log('1');
    const asset = await readAsset(request, useBrotli, context);
    console.log('2');
    // If no asset is found in memory or filesystem,
    // we mark it as missing in memcache so we don't request it anymore
    if (!asset) {
      next();

      return;
    }
    applyCommonHeaders(context)(response, request.url);
    response.setHeader('Content-Type', contentType);
    if (asset.isBrotli) {
      response.setHeader('Content-Encoding', 'br');
    }
    response.status(200).end(asset.data);
  };
}

function applyCommonHeaders(context: ServerContext): (res: Response, path: string) => void {
  return (res: Response, path: string) => {
    if (!path.endsWith('.html')) {
      // Cache all static files in the browser cache for a week
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      // Set last-modified for robots to reduce excessive resource crawling
      const GMTDate = addMinutes(context.launchTime, new Date().getTimezoneOffset()); // Get UTC time
      // Wed, 21 Oct 2015 07:28:00 GMT https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Last-Modified
      const date = format(GMTDate, 'E, dd MMM yyyy HH:mm:ss \'GMT\'');
      res.setHeader('Last-Modified', date);
    }
  };
}

async function readAsset(request: Request, allowBrotli: boolean, context: ServerContext): Promise<AssetChunk | null> {
  // MEMORY CACHE - BROTLI
  if (allowBrotli && context.assetMemCache.has(request.url, allowBrotli)) {
    const content = context.assetMemCache.get(request.url, allowBrotli) ?? null;
    if (content) {

      return content;
    }
  }

  // MEMORY CACHE - NO BROTLI
  if (context.assetMemCache.has(request.url, false)) {
    const content = context.assetMemCache.get(request.url, false) ?? null;
    if (content) {

      return content;
    }
  }

  // FS
  const assetPath = join(context.browserFolder, request.url);
  try {
    const content = await firstValueFrom(getBinaryFileChanges(assetPath));
    const result: AssetChunk = {
      data: content,
      isBrotli: false,
    };

    return result;
  // eslint-disable-next-line no-empty
  } catch {}

  return null;
}
