import { getPersonFromWB } from '../../../../app/models/person/person.interface';
import { caught } from '../../../helpers/caught/caught';
import { smartFetch } from '../../../helpers/smart-fetch';
import { UserResponse } from './models/user-response.interface';

export async function getWBUserV1(id: string): Promise<UserResponse> {
  // Get user hash from ID
  const userFormData = new FormData();
  userFormData.append('userId', id);
  const userHashResponse = await smartFetch(null, 'https://www.wildberries.ru/webapi/profile/spa/profile/url', {
    method: 'POST',
    body: userFormData,
  });
  if (!userHashResponse) {

    return {
      error: {
        error: 'No hash returned',
      },
      status: 500,
    };
  }
  const [userHashJsonError, userHashJSON] = await caught(userHashResponse?.json());
  if (userHashJsonError) {

    return {
      error: {
        error: 'Failed to parse user hash response',
        body: userHashJsonError,
      },
      status: 500,
    };
  }
  const userHash = userHashJSON?.value?.url ?? '';
  if (!userHash) {

    return {
      error: {
        error: 'User hash not found from hash response',
      },
      status: 400,
    };
  }
  const segments = userHash.split('/') || [];
  const hash = segments[segments.length - 1];

  // Get user profile by hash
  const userResponse = await smartFetch(null, `https://www.wildberries.ru/webapi/profile/${hash}/data`, { method: 'POST' });
  if (!userResponse) {

    return {
      error: {
        error: 'Empty user response',
      },
      status: 500,
    };
  }
  const [userJsonError, user] = await caught(userResponse?.json());
  if (userJsonError) {

    return {
      error: {
        error: 'Failed to parse profile response',
        body: userJsonError,
      },
      status: 500,
    };
  }
  user.path = userHash;
  const response = getPersonFromWB(id, user);

  return {
    response,
    status: userResponse?.status ?? 200,
  };
}
