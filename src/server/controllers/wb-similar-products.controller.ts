import { Request, Response as ExpressResponse } from 'express';
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
  const headers = { 'x-requested-with': 'XMLHttpRequest' };
  const [similarResponse, recommendedResponse, seeAlsoResponse] = await Promise.all([
    smartFetch(`https://in-similar.wildberries.ru/?nm=${id}`),
    smartFetch(`https://www.wildberries.ru/webapi/recommendations/recommended-by-nm/${id}`, { headers }),
    smartFetch(`https://www.wildberries.ru/webapi/recommendations/also-buy-by-nm/${id}`, { headers }),
  ]);
  if (similarResponse[0] && recommendedResponse[0] && seeAlsoResponse[1]) {
    response.status(500).send(similarResponse[0]);

    return;
  }
  const [
    [similarError, similar],
    [recommendedError, recommended],
    [seeAlsoError, seeAlso],
  ] = await Promise.all([
    caught(similarResponse[1]?.json()),
    caught(recommendedResponse[1]?.json()),
    caught(seeAlsoResponse[1]?.json()),
  ]);
  const ids = shuffle([similar ?? [], recommended?.value?.nmIds ?? [], seeAlso?.value?.nmIds ?? []].flat());
  const paramsList = new URLSearchParams({
    spp: '0',
    pricemarginCoeff: '1.0',
    reg: '0',
    appType: '1',
    emp: '0',
    locale: 'ru',
    lang: 'ru',
    curr: 'rub',
    nm: ids.join(';'),
  });
  const params = decodeURIComponent(`${paramsList}`);
  const [productsError, productsResponse] = await smartFetch(`https://card.wb.ru/cards/list?${params}`)
  if (productsError) {
    response.status(500).send(productsError);
  } else {
    const products = await productsResponse?.json();
    response.send(products);
  }
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
