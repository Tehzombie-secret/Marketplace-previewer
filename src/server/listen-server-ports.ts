import express from 'express';
import { cacheAssets } from './helpers/cache-assets';
import { ServerContext } from './models/server-context.interface';

export function listenServerPorts(server: express.Express, context: ServerContext): void {
  const ports = (process.env['PORT'] || '443,80')?.split(',') || [4000];
  let sideEffectsInitialized = false;
  ports.forEach((port: string | number) => {
    const shouldUseSideEffect = !sideEffectsInitialized;
    sideEffectsInitialized = true;
    // Start up the Node server
    server.listen(port, async () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
      if (shouldUseSideEffect) {
        cacheAssets(context.browserFolder, context.assetMemCache);
        // listenOnTraverseDemands(context.mongoDB);
      }
    });
  });
}
