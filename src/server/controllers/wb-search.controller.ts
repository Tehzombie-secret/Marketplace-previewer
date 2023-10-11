import { Request, Response } from 'express';
import { URLSearchParams } from 'url';
import { caught } from '../helpers/caught/caught';
import { emitRequestLog } from '../helpers/emit-request-log';
import { smartFetch } from '../helpers/smart-fetch';

export async function WBSearchController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const query = request.params['query'];
  if (!query) {
    response.sendStatus(400);

    return;
  }
  const page = request.query['page'];

  // Get items
  const params = new URLSearchParams({
    appType: '1',
    curr: 'rub',
    dest: '-1181032',
    regions: '80,38,83,4,64,33,68,70,30,40,86,69,1,31,66,48,22,114',
    resultset: 'catalog',
    sort: 'popular',
    spp: '32',
    suppressSpellcheck: 'false',
    uclusters: '1',
    query: decodeURIComponent(query),
    ...(typeof page === 'string' && +page > 1 ? { page } : null),
  });
  const url = `https://search.wb.ru/exactmatch/ru/common/v4/search?${params}`;
  const catalogResponse = await smartFetch(response, url);
  if (!catalogResponse) {
    response.status(500).send({
      error: 'No catalog response',
    });

    return;
  }
  const [catalogJsonError, catalog] = await caught(catalogResponse?.json());
  if (catalogJsonError) {
    response.status(500).send({
      error: 'Catalog json parse error',
      body: catalogJsonError
    });

    return;
  }
  response.send(catalog);
}

