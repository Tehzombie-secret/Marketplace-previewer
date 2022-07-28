import { Caught } from './models/caught.type';

export async function caught<T>(promise?: Promise<T>): Promise<Caught<T>> {
  if (!promise) {

    return [null, null];
  }
  try {
    const response = await promise;

    return [null, response];
  } catch (e) {
    return [e, null];
  }
}
