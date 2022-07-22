import { emitErrorLog } from '../../app/helpers/emit-error-log/emit-error-log';
import { ErrorReason } from '../../app/helpers/emit-error-log/models/error-reason.enum';
import { emitInfoLog } from '../../app/helpers/emit-log';

export function listenRuntimeErrors(): void {
  process
    // Close on docker SIGINT signal
    .on('SIGINT', () => {
      emitInfoLog('Shutdown on SIGINT');
      process.exit(0);
    })
    .on('uncaughtException', (error: Error | {}) => {
      emitErrorLog(ErrorReason.EXPRESS, error, 'Uncaught exception');
      if ((error as { code: string }).code === 'ERR_HTTP_INVALID_STATUS_CODE') {
        // Something sent incorrect status code, nothing serious


        return;
      }
      process.exit(1);
    })
    .on('unhandledRejection', (reason: {} | null) => {
      if ((reason as { code: string }).code === 'EAI_AGAIN') {
        // DNS lookup error, nothing critical here

        return;
      }
      emitErrorLog(ErrorReason.EXPRESS, reason, 'Unhandled promise rejection');
      process.exit(1);
    });
}
