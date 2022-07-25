/**
 * Works only against string enums. Please restrain from using
 * number or no values enums.
 */
export function valueIsInEnum<T extends Object>(enumClass: T, value: any): value is T {
  return Boolean(value) && Object.values(enumClass).includes(value);
}
