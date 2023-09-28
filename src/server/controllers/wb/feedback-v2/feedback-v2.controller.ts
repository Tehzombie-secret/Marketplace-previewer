import { Request, Response } from 'express';
import { emitRequestLog } from '../../../helpers/emit-request-log';
import { getFeedbackV2 } from './get-feedbacks-v2';

export async function WBFeedbackControllerV2(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  if (!id) {
    response.sendStatus(400);

    return;
  }
  const feedbacks = await getFeedbackV2(id);
  response.status(feedbacks.status).send(feedbacks.error ?? feedbacks.response);
}
