import { truthy } from './truthy';

export function toQueryString(params?: Record<string, string | string[] | number | boolean | null | undefined> | null): string {
  const query = Object.entries(params ?? {})
    .flatMap(([key, value]: [string, string | string[] | number | boolean | null | undefined]) => Array.isArray(value)
      ? value.map((listValue: string) => toQueryParam(key, listValue))
      : [toQueryParam(key, value)]
    )
    .filter(truthy)
    .join('&');
  const normalizedQuery = query ? `?${query}` : '';

  return normalizedQuery;
}

function toQueryParam(key: string, value: string | number | boolean | null | undefined): string | null {
  return value === null || value === undefined
    ? null
    : `${key}=${value}`;
}
