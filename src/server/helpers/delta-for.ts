import { getPreciseTime } from './get-precise-time';

export function deltaFor(time: number): number {
  return getPreciseTime() - time;
}
