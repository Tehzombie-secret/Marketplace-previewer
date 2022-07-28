import { Request, Response } from 'express';
import { caught } from '../helpers/caught/caught';
import { emitRequestLog } from '../helpers/emit-request-log';
import { retryable } from '../helpers/retryable';

export const WB_CATALOG_URL = 'https://www.wildberries.ru/webapi/menu/main-menu-ru-ru.json';

export async function WBCategoriesController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const [categoriesError, categoriesResponse] = await retryable(fetch(WB_CATALOG_URL));
  if (categoriesError) {
    response.status(500).send(categoriesError);
  } else if (categoriesResponse) {
    const [jsonError, responseBody] = await caught(categoriesResponse.json());
    if (jsonError) {
      response.status(500).send(jsonError)

      return;
    }
    response.status(categoriesResponse.status).send(responseBody);
  } else {
    response.status(500).send({ message: 'Empty response' });
  }
}
