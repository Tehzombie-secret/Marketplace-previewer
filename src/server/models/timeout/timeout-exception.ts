import { TimeoutReason } from './timeout-reason.enum';

export class TimeoutException extends Error {
  override readonly message = `Timeout exception: ${this.reason}`;

  constructor(
    public reason: TimeoutReason,
  ) {
    super();
  }
}
