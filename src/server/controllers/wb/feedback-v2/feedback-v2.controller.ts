import { Request, Response } from 'express';
import { emitRequestLog } from '../../../helpers/emit-request-log';
import { MongoDBService } from '../../../services/mongodb/mongodb.service';
import { getFeedbackV2 } from './get-feedbacks-v2';

export async function WBFeedbackControllerV2(request: Request, response: Response, mongoDB: MongoDBService): Promise<void> {
  emitRequestLog(request, response);

  const imtId = request.query['imtId'];
  const nmId = request.query['nmId'];
  const feedbacks = await getFeedbackV2(typeof imtId === 'string' ? imtId : null, typeof nmId === 'string' ? nmId : null, mongoDB);
  response.status(feedbacks.status).send(feedbacks.error ?? feedbacks.response);
}
