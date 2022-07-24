import { COLOR_REVERT } from './color-revert.const';

const CYAN_TEXT = '\u001b[36m';

export function cyanText(message: string | number): string {
  return `${CYAN_TEXT}${message}${COLOR_REVERT}`;
}
