import * as bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentController } from './controllers/document.controller';
import { reverseProxyController } from './controllers/reverse-proxy.controller';
import { robotsController } from './controllers/robots.controller';
import { staticAssetsController } from './controllers/static-assets.controller';
import { WBCategoriesController } from './controllers/wb-categories.controller';
import { WBFeedbackController } from './controllers/wb-feedback.controller';
import { WBSearchController } from './controllers/wb-search.controller';
import { WBSimilarProductsController } from './controllers/wb-similar-products.controller';
import { WBCategoriesListController } from './controllers/wb/categories-list/categories-list.controller';
import { WBFeedbackSearchController } from './controllers/wb/feedback-search/feedback-search.controller';
import { WBFeedbackControllerV2 } from './controllers/wb/feedback-v2/feedback-v2.controller';
import { WBProductListController } from './controllers/wb/product-list/product-list.controller';
import { WBProductController } from './controllers/wb/product/product.controller';
import { WBUserController } from './controllers/wb/user/user.controller';
import { VendorPlatform } from './models/image-platform.enum';
import { ServerContext } from './models/server-context.interface';

// The Express app is exported so that it can be used by serverless Functions.
export async function createServer(context: ServerContext): Promise<express.Express> {
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const indexHtml = join(serverDistFolder, 'index.server.html');

  return express()
    .get('/healthcheck', (req: express.Request, res: express.Response) => res.send('OK'))
    .get('/robots.txt', robotsController)
    .use(compression())
    .use('/api', express.Router()
      .use(`/${VendorPlatform.WB}`, express.Router()
        .use('/categories', express.Router()
          .get('/', WBCategoriesController)
          .get('/all', WBCategoriesListController)
        )
        .get('/catalog/:id', WBProductListController)
        .get('/search/:query', WBSearchController)
        .get('/v1/product/:id', WBProductController)
        .get('/product/:id/similar', WBSimilarProductsController)
        .get('/user/:id', (req, res) => WBUserController(req, res, context.mongoDB))
        .post('/feedback', bodyParser.json(), WBFeedbackController)
        .get('/v2/feedback', (req, res) => WBFeedbackControllerV2(req, res, context.mongoDB))
        .get('/v1/feedback/search', (req, res) => WBFeedbackSearchController(req, res, context.mongoDB))
      )
      .use('/common', express.Router()
        .get('/rp', reverseProxyController)
        .get('/meta', (req: express.Request, res: express.Response) => res.send({ l: context.launchTime }))
      )
    )
    .get('*.*', staticAssetsController(context))
    .get('*', documentController(indexHtml));
}
