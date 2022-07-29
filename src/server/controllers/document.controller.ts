import { Handler, Request, Response } from 'express';
import { emitRequestLog } from '../helpers/emit-request-log';

export function documentController(indexHTML: string): Handler {
  return (request: Request, response: Response) => {
    emitRequestLog(request, response);

    response.send(indexHTML);
  };
}
