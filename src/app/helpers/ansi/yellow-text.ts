import { COLOR_REVERT } from './color-revert.const';

const YELLOW_TEXT = '\u001b[33m';

export function yellowText(message: string | number): string {
  return `${YELLOW_TEXT}${message}${COLOR_REVERT}`;
}
