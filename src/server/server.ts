import * as bodyParser from 'body-parser';
import * as express from 'express';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import 'zone.js/dist/zone-node';
import { reverseProxyController } from './controllers/reverse-proxy.controller';
import { WBFeedbackController } from './controllers/wb-feedback.controller';
import { WBImageController } from './controllers/wb-image.controller';
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
    .use('/api', express.Router()
      .use(`/${VendorPlatform.WB}`, express.Router()
        .get('/product/:id/similar', WBSimilarProductsController)
        .get('/image/:size/:id/:name', WBImageController)
        .get('/user/:id', WBUserController)
        .post('/feedback', bodyParser.json(), WBFeedbackController)
      )
      .use('/common', express.Router()
        .get('/rp', reverseProxyController)
      )
    )
    .get(
      '/.well-known/acme-challenge/KEG4b2Ini6Socf235BBSS5JdZYLrY_wMtD-JeY2wHvE',
      (_: express.Request, res: express.Response) =>
        res.send('KEG4b2Ini6Socf235BBSS5JdZYLrY_wMtD-JeY2wHvE.fJUmVeVv-MZ-UAICqcujCw-CM-lcLuVwwLlb3pVj4bQ'),
    )
    .get('*.*', express.static(distFolder, { maxAge: '3d' }))
    .get('*', (req, res) => res.send(indexHTML));
}

async function run(): Promise<void> {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = await app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
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
