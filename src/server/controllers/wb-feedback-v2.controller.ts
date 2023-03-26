import { Request, Response } from 'express';
import { caught } from '../helpers/caught/caught';
import { emitRequestLog } from '../helpers/emit-request-log';
import { smartFetch } from '../helpers/smart-fetch';

export async function WBFeedbackControllerV2(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  if (!id) {
    response.sendStatus(400);

    return;
  }
  const feedbacksResponse = await smartFetch(response, `https://feedbacks1.wb.ru/feedbacks/v1/${id}`, {
    headers: { 'content-type': 'application/json' },
    method: 'GET',
  });
  if (!feedbacksResponse) {

    return;
  }
  const [jsonError, responseBody] = await caught(feedbacksResponse.json());
  if (jsonError) {
    response.status(500).send(jsonError);

    return;
  }
  response.status(feedbacksResponse.status).send(responseBody);
}
