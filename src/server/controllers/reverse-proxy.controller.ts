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
  const useBrotli = acceptEncoding.includes('br') || acceptEncoding.includes('*');
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
  const arrayBuffer = await proxyResponse.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  if (useBrotli) {
    const brotliImageBuffer = await getBrotliContent(imageBuffer, 4);
    response.setHeader('Content-Encoding', 'br');
    response.removeHeader('Content-Length');
    response.end(brotliImageBuffer);
  } else {
    response.end(imageBuffer);
  }
}
