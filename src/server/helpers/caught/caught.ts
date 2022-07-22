import { Caught } from './models/caught.type';

export async function caught<T>(promise: Promise<T>): Promise<Caught<T>> {
  try {
    const response = await promise;

    return [null, response];
  } catch (e) {
    return [e, null];
  }
}
