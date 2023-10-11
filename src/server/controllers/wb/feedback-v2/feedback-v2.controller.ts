import { Request, Response } from 'express';
import { emitRequestLog } from '../../../helpers/emit-request-log';
import { MongoDBService } from '../../../services/mongodb/mongodb.service';
import { getFeedbackV2 } from './get-feedbacks-v2';

export async function WBFeedbackControllerV2(request: Request, response: Response, mongoDB: MongoDBService): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  if (!id) {
    response.sendStatus(400);

    return;
  }
  const feedbacks = await getFeedbackV2(id, mongoDB);
  response.status(feedbacks.status).send(feedbacks.error ?? feedbacks.response);
}
