import { Request, Response } from 'express';
import { caught } from '../helpers/caught/caught';
import { emitRequestLog } from '../helpers/emit-request-log';
import { smartFetch } from '../helpers/smart-fetch';
import { WB_CATALOG_URL } from './wb/categories-list/get-categories-list';

export async function WBCategoriesController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const [error, categoriesResponse] = await smartFetch(WB_CATALOG_URL);
  if (error) {
    response.status(500).send(error);

    return;
  }
  if (!categoriesResponse) {

    return;
  }
  const [jsonError, responseBody] = await caught(categoriesResponse?.json?.());
  if (jsonError) {
    response.status(500).send(jsonError)

    return;
  }
  response.status(categoriesResponse.status).send(responseBody);
}
