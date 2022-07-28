import { Request, Response } from 'express';
import { caught } from '../helpers/caught/caught';
import { emitRequestLog } from '../helpers/emit-request-log';
import { retryable } from '../helpers/retryable';

export async function WBUserController(request: Request, response: Response): Promise<void> {
  emitRequestLog(request, response);

  const id = request.params['id'];
  if (!id) {
    response.sendStatus(404);

    return;
  }

  // Get user hash from ID
  const userFormData = new FormData();
  userFormData.append('userId', id);
  const userHashResponse = await fetch('https://www.wildberries.ru/webapi/profile/spa/profile/url', {
    method: 'POST',
    body: userFormData,
  });
  const [userHashJsonError, userHashJSON] = await caught(userHashResponse.json());
  if (userHashJsonError) {
    response.status(500).send(userHashJsonError);

    return;
  }
  const userHash = userHashJSON?.value?.url ?? '';
  if (!userHash) {
    response.sendStatus(400);

    return;
  }
  const segments = userHash.split('/') || [];
  const hash = segments[segments.length - 1];

  // Get user profile by hash
  const [userError, userResponse] = await retryable(fetch(`https://www.wildberries.ru/webapi/profile/${hash}/data`, { method: 'POST' }));
  if (userError) {
    response.status(500).send(userError);

    return;
  }
  const [userJsonError, user] = await caught(userResponse?.json());
  if (userJsonError) {
    response.status(500).send(userJsonError);

    return;
  }
  user.path = userHash;
  response.status(userResponse?.status ?? 200).send(user);
}
