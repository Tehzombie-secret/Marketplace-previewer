import { Request, Response } from 'express';
import { emitRequestLog } from '../../../helpers/emit-request-log';
import { getWBProduct } from './get-product';

export async function WBProductController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  if (!id) {
    response.sendStatus(200);

    return;
  }
  const result = await getWBProduct(id);
  response.status(500).send(`done, ${JSON.stringify(result)}`);
  return;
  if (result.error || result.errorStatus) {
    response.status(500).send(`err, ${result.errorStatus}`);
    // response.status(result.errorStatus ?? 500).send(result.error);

    return;
  }
  response.send(`ok, ${result.errorStatus}`);
  // response.send(result.result);
}
