import { COLOR_REVERT } from './color-revert.const';

const GREEN_TEXT = '\x1b[32m';

export function greenText(message: string | number): string {
  return `${GREEN_TEXT}${message}${COLOR_REVERT}`;
}
