import { AssetMemCacheService } from '../services/asset-mem-cache.service';

export interface ServerContext {
  launchTime: Date;
  assetMemCache: AssetMemCacheService;
  browserFolder: string;
}
