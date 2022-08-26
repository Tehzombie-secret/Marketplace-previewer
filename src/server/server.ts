import * as bodyParser from 'body-parser';
import * as express from 'express';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import 'zone.js/dist/zone-node';
import { documentController } from './controllers/document.controller';
import { reverseProxyController } from './controllers/reverse-proxy.controller';
import { robotsController } from './controllers/robots.controller';
import { WBCatalogController } from './controllers/wb-catalog.controller';
import { WBCategoriesController } from './controllers/wb-categories.controller';
import { WBFeedbackController } from './controllers/wb-feedback.controller';
import { WBSearchController } from './controllers/wb-search.controller';
import { WBSimilarProductsController } from './controllers/wb-similar-products.controller';
import { WBUserController } from './controllers/wb-user.controller';
import { listenRuntimeErrors } from './helpers/listen-runtime-errors';
import { VendorPlatform } from './models/image-platform.enum';

// The Express app is exported so that it can be used by serverless Functions.
export async function app(): Promise<express.Express> {
  listenRuntimeErrors();

  const distFolder = join(process.cwd(), 'dist/wb/browser');
  const indexHTMLPath = existsSync(join(distFolder, 'index.original.html'))
    ? join(distFolder, 'index.original.html')
    : join(distFolder, 'index.html');
  const indexHTML = await readFile(indexHTMLPath, { encoding: 'utf8' });

  return express()
    .get('/healthcheck', (req: express.Request, res: express.Response) => res.send('OK'))
    .get('/robots.txt', robotsController)
    .use('/api', express.Router()
      .use(`/${VendorPlatform.WB}`, express.Router()
        .get('/categories', WBCategoriesController)
        .get('/catalog/:id', WBCatalogController)
        .get('/search/:query', WBSearchController)
        .get('/product/:id/similar', WBSimilarProductsController)
        .get('/user/:id', WBUserController)
        .post('/feedback', bodyParser.json(), WBFeedbackController)
      )
      .use('/common', express.Router()
        .get('/rp', reverseProxyController)
      )
    )
    .get('*.*', express.static(distFolder, { maxAge: '3d' }))
    .get('*', documentController(indexHTML));
}

async function run(): Promise<void> {
  const ports = (process.env['PORT'] || '443,80')?.split(',') || [4000];
  const server = await app();
  ports.forEach((port: string | number) => {
    // Start up the Node server
    server.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './main.server';
