import { Request, Response } from 'express';
import { emitRequestLog } from '../../../helpers/emit-request-log';
import { getCategoriesList } from './get-categories-list';

export async function WBCategoriesListController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);
  const categoriesResponse = await getCategoriesList();
  response.status(categoriesResponse.status).send(categoriesResponse?.error ?? categoriesResponse?.slugs ?? []);
}
