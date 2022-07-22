import { Request, Response } from 'express';

export async function WBUserController(request: Request, response: Response): Promise<void> {
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
  const userHashJSON = await userHashResponse.json();
  const userHash = userHashJSON?.value?.url ?? '';
  if (!userHash) {
    response.sendStatus(400);

    return;
  }
  const segments = userHash.split('/') || [];
  const hash = segments[segments.length - 1];

  // Get user profile by hash
  const userResponse = await fetch(`https://www.wildberries.ru/webapi/profile/${hash}/data`, { method: 'POST' });
  // TODO add path field
  const user = await userResponse.json();
  user.path = userHash;
  response.status(userResponse.status).send(user);
}
