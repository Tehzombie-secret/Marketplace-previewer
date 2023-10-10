import { Request, Response as ExpressResponse } from 'express';
import { truthy } from '../../app/helpers/truthy';
import { caught } from '../helpers/caught/caught';
import { emitRequestLog } from '../helpers/emit-request-log';
import { smartFetch } from '../helpers/smart-fetch';

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
  /**
   *
   */
  const paramsList = new URLSearchParams({
    appType: '1',
    curr: 'rub',
    dest: '-1181032',
    regions: '80,83,38,4,64,33,68,70,30,40,86,69,1,66,22,48,31,112,114',
    spp: '29',
    nm: ids.join(';'),
  });
  const params = decodeURIComponent(`${paramsList}`);
  const productsResponse = await smartFetch(response, `https://card.wb.ru/cards/list?${params}`)
  if (!productsResponse) {

    return;
  }
  const [productJsonError, products] = await caught(productsResponse?.json());
  if (productJsonError) {
    response.status(500).send(productJsonError);

    return;
  }
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
