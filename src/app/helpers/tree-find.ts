/**
 * Recursively searches among tree
 */
export function treeFind<T>(
  items: T[] | null | undefined,
  childrenMapper: (item: T) => T[],
  condition: (item: T) => boolean
): T | null {
  for (let item of (items || [])) {
    if (condition(item)) {

      return item;
    }
    const foundItem = treeFind(childrenMapper(item), childrenMapper, condition);
    if (foundItem) {

      return foundItem;
    }
  }

  return null;
}
