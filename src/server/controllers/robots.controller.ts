import { Request, Response } from 'express';

export function robotsController(_request: Request, response: Response): void {
  response.type('text/plain');
  const robots = [
    'User-agent: *',
    'Disallow: /',
  ].join('\n');
  response.send(robots);
}
