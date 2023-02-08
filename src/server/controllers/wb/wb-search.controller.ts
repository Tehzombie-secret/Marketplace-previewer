import { Request, Response } from 'express';
import { URLSearchParams } from 'url';
import { caught } from '../../helpers/caught/caught';
import { emitRequestLog } from '../../helpers/emit-request-log';
import { smartFetch } from '../../helpers/smart-fetch';

export async function WBSearchController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const query = request.params['query'];
  const page = request.query['page'];
  if (!query) {
    response.sendStatus(400);

    return;
  }

  // Get items
  const params = new URLSearchParams({
    regions: '68,64,83,4,38,80,33,70,82,86,30,69,22,66,31,40,1,48',
    appType: '1',
    curr: 'rub',
    dest: '-1216601,-337422,-1114354,-1181032',
    lang: 'ru',
    locale: 'ru',
    pricemarginCoeff: '1.0',
    resultset: 'catalog',
    spp: '26',
    suppressSpellcheck: 'false',
    query: decodeURIComponent(query),
  });
  if (page && (typeof page === 'number' || typeof page === 'string')) {
    params.append('page', page);
  }
  const url = `https://search.wb.ru/exactmatch/ru/common/v4/search?${params}`;
  const catalogResponse = await smartFetch(response, url);
  if (!catalogResponse) {

    return;
  }
  const [catalogJsonError, catalog] = await caught(catalogResponse?.json());
  if (catalogJsonError) {
    response.status(500).send(catalogJsonError);

    return;
  }
  response.send(catalog);
}

