import { AssetChunk } from '../models/asset-chunk.interface';

export class AssetMemCacheService {
  private readonly pathToAssetMap = new Map<string, AssetChunk>();
  private readonly pathToBrotliAssetMap = new Map<string, AssetChunk>();

  has(path: string, useBrotli: boolean): boolean {
    return useBrotli
      ? this.pathToBrotliAssetMap.has(path)
      : this.pathToAssetMap.has(path);
  }

  get(path: string, useBrotli: boolean): AssetChunk | null {
    return useBrotli
      ? (this.pathToBrotliAssetMap.get(path) ?? null)
      : (this.pathToAssetMap.get(path) ?? null);
  }

  set(path: string, content: Buffer, brotliContent?: Buffer): void {
    this.pathToAssetMap.set(path, {
      data: content,
      isBrotli: false,
    });
    if (brotliContent) {
      this.pathToBrotliAssetMap.set(path, {
        data: brotliContent,
        isBrotli: true,
      });
    }
  }
}
