import { Response } from 'express';
import { emitErrorLog } from '../../app/helpers/emit-error-log/emit-error-log';
import { ErrorReason } from '../../app/helpers/emit-error-log/models/error-reason.enum';
import { retryable } from './retryable';

export async function smartFetch(response: Response | null, input: string, init?: RequestInit): Promise<globalThis.Response | null> {
  const abort = new AbortController();
  setTimeout(() => abort.abort(), 20_000);
  const [fetchError, fetchResponse] = await retryable(fetch(input, init));
  if (fetchError) {
    emitErrorLog(ErrorReason.EXPRESS, fetchError, `Subfetch ${input} error`);
    const error = {
      type: 'subfetch error',
      url: input,
      error: fetchError,
    };
    response?.status(500)?.send(error);

    return null;
  }
  if (!fetchResponse) {
    emitErrorLog(ErrorReason.EXPRESS, '', `Subfetch ${input} empty response`);
    const error = {
      type: 'subfetch empty response',
      url: input,
    };
    response?.status(500)?.send(error);

    return null;
  }

  return fetchResponse;
}
