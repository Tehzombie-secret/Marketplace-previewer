import { Request, Response } from 'express';
import { emitRequestLog } from '../../../helpers/emit-request-log';
import { MongoDBService } from '../../../services/mongodb/mongodb.service';
import { getWBUserV2 } from './get-user-v2';

export async function WBUserController(request: Request, response: Response, mongoDB: MongoDBService): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  if (!id) {
    response.sendStatus(404);

    return;
  }

  const result = await getWBUserV2(mongoDB, id);
  response.status(result.status).send(result.error ?? result.response);
}
