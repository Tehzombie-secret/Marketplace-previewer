import { Request, Response } from 'express';
import { emitRequestLog } from '../helpers/emit-request-log';
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
  const decodedURL = decodeURI(decoupledURL);
  const [error, proxyResponse] = await smartFetch(decodedURL);
  if (error) {
    response.status(500).send(error);

    return;
  }
  response.status(proxyResponse?.status ?? 500);
  const excludedHeaders = ['content-encoding'];
  if (!proxyResponse?.headers) {
    response.send(proxyResponse);

    return;
  }
  proxyResponse?.headers?.forEach((value: string, key: string) => {
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
  if (url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.webp')) {
    return true;
  }
  const contentType = response.getHeader('Content-Type');
  return typeof contentType === 'string' && (contentType.startsWith('image/') || contentType === 'application/octet-stream');
}
