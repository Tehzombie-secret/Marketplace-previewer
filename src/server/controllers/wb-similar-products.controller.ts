import { Request, Response as ExpressResponse } from 'express';
import { truthy } from '../../app/helpers/truthy';
import { caught } from '../helpers/caught/caught';
import { emitRequestLog } from '../helpers/emit-request-log';
import { smartFetch } from '../helpers/smart-fetch';
import { getWBProductListByNM } from './wb/product-list-by-nm/product-list-by-nm';

export async function WBSimilarProductsController(request: Request, response: ExpressResponse): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  if (!id) {
    response.sendStatus(400);

    return;
  }
  const [recommendedResponse, seeAlsoResponse] = await Promise.all([
    smartFetch(response, `https://rec-goods.wildberries.ru/api/v1/recommendations?nm=${id}`),
    smartFetch(response, `https://waterfall-card-rec.wildberries.ru/api/v1/recommendations?nm=${id}`),
  ]);
  if (!recommendedResponse || !seeAlsoResponse) {
    response.sendStatus(500);

    return;
  }
  const [
    [recommendedError, recommended],
    [seeAlsoError, seeAlso],
  ] = await Promise.all([
    caught(recommendedResponse?.json()),
    caught(seeAlsoResponse?.json()),
  ]);
  const ids = [
    recommended?.nms ?? [],
    (seeAlso as {nm: number}[])?.map((item) => item.nm)?.filter(truthy) ?? [],
  ].flat();

  const products = await getWBProductListByNM(ids);
  response.send(products);
}

function shuffle<T>(array: T[]): T[] {
  let clonedArray = [...array];
  let currentIndex = clonedArray.length;
  let randomIndex: number | null = null;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [clonedArray[currentIndex], clonedArray[randomIndex]] = [clonedArray[randomIndex], clonedArray[currentIndex]];
  }

  return clonedArray;
}
