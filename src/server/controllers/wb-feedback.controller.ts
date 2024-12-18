import { Request, Response } from 'express';
import { WBFeedbackRequest } from '../../app/services/api/models/wb/feedback/v1/wb-feedback-request.interface';
import { caught } from '../helpers/caught/caught';
import { emitRequestLog } from '../helpers/emit-request-log';
import { smartFetch } from '../helpers/smart-fetch';

export async function WBFeedbackController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const body: WBFeedbackRequest = {
    imtId: request?.body?.imtId,
    skip: request?.body?.skip,
    take: request?.body?.take,
  };
  const [error, feedbacksResponse] = await smartFetch('https://public-feedbacks.wildberries.ru/api/v1/summary/full', {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });
  if (error) {
    response.status(500).send(error);

    return;
  }
  if (!feedbacksResponse) {

    return;
  }
  const [jsonError, responseBody] = await caught(feedbacksResponse?.json?.());
  if (jsonError) {
    response.status(500).send(jsonError);

    return;
  }
  response.status(feedbacksResponse.status).send(responseBody);
}
