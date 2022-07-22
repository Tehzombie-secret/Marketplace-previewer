import { environment } from '../../environments/environment';
import { LogType } from '../models/log-type.enum';

export function emitInfoLog(message: string, humanReadableMessage?: string, source?: string): void {
  environment.jsonLogs
    ? console.log(JSON.stringify({
      type: LogType.INFO,
      message,
      source,
    }))
    : console.log(`${source ? `${source}: ` : ''}${humanReadableMessage || message}`);
}
