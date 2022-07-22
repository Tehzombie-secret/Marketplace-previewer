/**
 * Properly typed shorthand boolean assertion for array chain,
 * e.g.
 * ```typescript
 * fn(arr: (string | undefined | null)[]): string[] {
 *  return arr.filter(truthy);
 * }
 * ```
 */
export function truthy<T, S extends NonNullable<T>>(value?: T): value is S {
  return Boolean(value);
}
