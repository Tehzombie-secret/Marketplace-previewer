import { getPersonFromWB } from '../../../../app/models/person/person.interface';
import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';
import { UserResponse } from './models/user-response.interface';

export async function getWBUserV1(id: string): Promise<UserResponse> {
  // Get user hash from ID
  const userFormData = new FormData();
  userFormData.append('userId', id);
  const [userHashError, userHashResponse] = await smartFetch('https://www.wildberries.ru/webapi/profile/spa/profile/url', {
    method: 'POST',
    body: userFormData,
  });
  if (userHashError) {

    return {
      status: 500,
      error: userHashError,
    };
  }
  if (!userHashResponse) {

    return {
      status: 500,
      error: {
        error: 'No hash returned',
      },
    };
  }
  const [userHashJsonError, userHashJSON] = await caught(userHashResponse?.json?.());
  if (userHashJsonError) {

    return {
      status: 500,
      error: {
        error: 'Failed to parse user hash response',
        body: userHashJsonError,
      },
    };
  }
  const userHash = userHashJSON?.value?.url ?? '';
  if (!userHash) {

    return {
      status: 400,
      error: {
        error: 'User hash not found from hash response',
      },
    };
  }
  const segments = userHash.split('/') || [];
  const hash = segments[segments.length - 1];

  // Get user profile by hash
  const [userError, userResponse] = await smartFetch(`https://www.wildberries.ru/webapi/profile/${hash}/data`, { method: 'POST' });
  if (userError) {

    return {
      status: 500,
      error: userError,
    };
  }
  if (!userResponse) {

    return {
      status: 500,
      error: {
        error: 'Empty user response',
      },
    };
  }
  const [userJsonError, user] = await caught(userResponse?.json?.());
  if (userJsonError) {

    return {
      status: 500,
      error: {
        error: 'Failed to parse profile response',
        body: userJsonError,
      },
    };
  }
  user.path = userHash;
  const response = getPersonFromWB(id, user);

  return {
    status: userResponse?.status ?? 200,
    response,
  };
}
