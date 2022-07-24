import { COLOR_REVERT } from './color-revert.const';

const RED_TEXT = '\u001b[31m';

export function redText(message: string | number): string {
  return `${RED_TEXT}${message}${COLOR_REVERT}`;
}
