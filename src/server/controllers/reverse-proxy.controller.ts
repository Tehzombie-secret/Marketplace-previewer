import { Request, Response } from 'express';
import { emitRequestLog } from '../helpers/emit-request-log';
import { getBrotliContent } from '../helpers/get-brotli-content';
import { smartFetch } from '../helpers/smart-fetch';

export async function reverseProxyController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const url = request.query['url'];
  if (!url) {
    response.sendStatus(200);

    return;
  }
  const decoupledURL = typeof url === 'string'
    ? url
    : null;
  if (!decoupledURL) {
    response.sendStatus(200);

    return;
  }
  const proxyResponse = await smartFetch(response, decodeURI(decoupledURL));
  if (!proxyResponse) {

    return;
  }
  const acceptEncoding = request.header('Accept-Encoding') || '';
  response.status(proxyResponse.status);
  const excludedHeaders = ['content-encoding'];
  proxyResponse.headers.forEach((value: string, key: string) => {
    if (!key || !value || excludedHeaders.includes(key.toLowerCase())) {

      return;
    }
    response.setHeader(key, value);
  });
  if (!response.getHeader('Access-Control-Expose-Headers')) {
    response.setHeader('Access-Control-Expose-Headers', 'content-type');
  }
  if (!response.getHeader('Access-Control-Allow-Origin')) {
    response.setHeader('Access-Control-Allow-Origin', '*');
  }
  if (isImage(decoupledURL, response)) {
    response.setHeader('Cache-Control', `public, max-age=172800`); // 2 days
  }
  const arrayBuffer = await proxyResponse.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  response.end(imageBuffer);
  // Compression for images is not required, they're already compressed
}

function isImage(url: string, response: Response): boolean {
  if (url.endsWith('.jpg') || url.endsWith('.png')) {
    return true;
  }
  const contentType = response.getHeader('Content-Type');
  return typeof contentType === 'string' && (contentType.startsWith('image/') || contentType === 'application/octet-stream');
}
