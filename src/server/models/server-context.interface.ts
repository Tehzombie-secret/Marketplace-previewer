import { AssetMemCacheService } from '../services/asset-mem-cache.service';
import { MongoDBService } from '../services/mongodb/mongodb.service';

export interface ServerContext {
  launchTime: Date;
  assetMemCache: AssetMemCacheService;
  mongoDB: MongoDBService;
  browserFolder: string;
}
