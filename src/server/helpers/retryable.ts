import { caught } from './caught/caught';
import { Caught } from './caught/models/caught.type';
import { timeout } from './timeout';

const RETRY_TIMEOUT = [100, 600, 1000, 2000];

export async function retryable<T>(promise: Promise<T>): Promise<Caught<T, any>> {
  let retries = 0;
  let lastError: any = null;
  do {
    const [error, result] = await caught(promise);
    if (result) {

      return [null, result as T];
    } else {
      lastError = error;
      retries++;
    }

    // Exponentially wait for next try
    await timeout(RETRY_TIMEOUT[retries]);
  } while (retries <= RETRY_TIMEOUT.length);

  return [lastError, null];
}
