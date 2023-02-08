import { Request, Response } from 'express';
import { caught } from '../../helpers/caught/caught';
import { emitRequestLog } from '../../helpers/emit-request-log';
import { smartFetch } from '../../helpers/smart-fetch';

export const WB_CATALOG_URL = 'https://www.wildberries.ru/webapi/menu/main-menu-ru-ru.json';

export async function WBCategoriesController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const categoriesResponse = await smartFetch(response, WB_CATALOG_URL);
  if (!categoriesResponse) {

    return;
  }
  const [jsonError, responseBody] = await caught(categoriesResponse.json());
  if (jsonError) {
    response.status(500).send(jsonError)

    return;
  }
  response.status(categoriesResponse.status).send(responseBody);
}
