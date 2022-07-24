import { Request, Response } from 'express';
import { WBFeedbackRequest } from '../../app/services/wb-api/models/feedback/wb-feedback-request.interface';
import { emitRequestLog } from '../helpers/emit-request-log';
import { retryable } from '../helpers/retryable';

export async function WBFeedbackController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const body: WBFeedbackRequest = {
    imtId: request?.body?.imtId,
    skip: request?.body?.skip,
    take: request?.body?.take,
  };
  const [feedbacksError, feedbacksResponse] = await retryable(fetch('https://public-feedbacks.wildberries.ru/api/v1/summary/full', {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  }));
  if (feedbacksError) {
    response.status(500).send(feedbacksError);
  } else if (feedbacksResponse) {
    const responseBody = await feedbacksResponse.json();
    response.status(feedbacksResponse.status).send(responseBody);
  } else {
    response.status(500).send({ message: 'Empty response' });
  }
}
