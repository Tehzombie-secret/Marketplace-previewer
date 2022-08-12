export function fromQueryString<T extends Record<string, string | string[]>>(query: string): T;
export function fromQueryString<T extends Object>(query: string): T;
export function fromQueryString(query: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  decodeQueryString(query)
    .split('&')
    .filter((value: string | '') => Boolean(value))
    .map((param: string) => param.split('='))
    .filter(([_key, value]: string[]) => Boolean(value))
    .forEach(([key, value]: string[]) => {
      const resultValue = result[key] as (string | string[] | undefined);
      if (resultValue === undefined) {
        result[key] = value;

        return;
      }
      if (Array.isArray(resultValue)) {
        resultValue.push(value);

        return;
      }
      result[key] = [resultValue, value];
    });

  return result;
}

function decodeQueryString(query?: string | null): string {
  try {
    return decodeURIComponent(query ?? '');
  } catch {
    return query ?? '';
  }
}
