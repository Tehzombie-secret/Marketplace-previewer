import { environment } from '../../../environments/environment';
import { LogType } from '../../models/log-type.enum';
import { ErrorReason } from './models/error-reason.enum';

export function emitErrorLog(
  reason: ErrorReason,
  error: Error | {} | null | unknown,
  description?: string,
): void {
  environment.jsonLogs
    ? console.log(JSON.stringify({
      type: LogType.ERROR,
      reason,
      // Restrict length in case of unjustifiably long messages
      message: (error as Error)?.message?.substring(0, 18000),
      stack: (error as Error)?.stack?.substring(0, 18000),
      code: (error as { code: string })?.code ?? '',
      description,
    }))
    : console.error('Error emitted:', !error ? description : '', error);
}
