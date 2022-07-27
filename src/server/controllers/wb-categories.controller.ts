import { Request, Response } from 'express';
import { emitRequestLog } from '../helpers/emit-request-log';
import { retryable } from '../helpers/retryable';

export async function WBCategoriesController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const [categoriesError, categoriesResponse] = await retryable(fetch('https://www.wildberries.ru/webapi/menu/main-menu-ru-ru.json'));
  if (categoriesError) {
    response.status(500).send(categoriesError);
  } else if (categoriesResponse) {
    const responseBody = await categoriesResponse.json();
    response.status(categoriesResponse.status).send(responseBody);
  } else {
    response.status(500).send({ message: 'Empty response' });
  }
}
