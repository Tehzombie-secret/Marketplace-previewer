import { Caught } from './caught/models/caught.type';
import { retryable } from './retryable';

export async function smartFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Caught<globalThis.Response>> {
  const abort = new AbortController();
  setTimeout(() => abort.abort(), 20_000);
  const response = await retryable(fetch(input, init));

  return response;
}
