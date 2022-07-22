import { filter } from 'rxjs/operators';

/** 
 * filter(Boolean) and filter((item) => !!item) is an universal holywar. 
 * This operator settles this once and for all with a third option.
 */
export const filterTruthy = <T>() => filter<T, NonNullable<T>>(isTruthy);

function isTruthy<T>(value?: T | null): value is NonNullable<T> {
    return Boolean(value);
}
