export function getWBProductCategoryId(productId: string): string {
  const pad = productId.substring(0, productId.length - 4);
  const productCategory = pad.padEnd(pad.length + 4, '0');

  return productCategory;
}
