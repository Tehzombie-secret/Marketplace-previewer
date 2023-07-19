import { join } from 'path';
import { ServerContext } from '../models/server-context.interface';
import { AssetMemCacheService } from '../services/asset-mem-cache.service';
import { MongoDBService } from '../services/mongodb/mongodb.service';

export function generateServerContext(): ServerContext {
  const context: ServerContext = {
    launchTime: new Date(),
    assetMemCache: new AssetMemCacheService(),
    mongoDB: new MongoDBService(),
    browserFolder: join(process.cwd(), 'dist/wb/browser'),
  };

  return context;
}
