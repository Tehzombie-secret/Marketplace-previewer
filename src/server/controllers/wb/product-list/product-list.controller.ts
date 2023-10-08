import { Request, Response } from 'express';
import { emitRequestLog } from '../../../helpers/emit-request-log';
import { getProductList } from './get-product-list';

export async function WBProductListController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  const result = await getProductList(id);
  response.status(result.status).send(result.error ?? result.items);
}

