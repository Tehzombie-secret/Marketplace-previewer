export function getWBProductURL(id?: string | number | null): string | null {
  if (!id) {

    return null;
  }

  return `https://www.wildberries.ru/catalog/${id}/detail.aspx`
}
