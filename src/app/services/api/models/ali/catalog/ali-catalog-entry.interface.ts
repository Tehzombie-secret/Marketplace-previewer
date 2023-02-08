import { Photo } from '../../../../../models/photo/photo.interface';
import { Product } from '../../../../../models/product/product.interface';
import { APIPlatform } from '../../api-platform.enum';
import { AliProductParams } from '../product/ali-product-params.interface';
import { AliCatalogFeed } from './ali-catalog-feed.interface';
import { AliCatalogProduct } from './ali-catalog-product.interface';

export interface AliCatalogEntry {
  productsFeed: AliCatalogFeed;
  over18: boolean;
  page: number;
  searchInfo: string;
}

const skuIdRegex = /sku_id=(\d+)/;

export function mapProductsFromCatalogAli(dto?: AliCatalogEntry | null): Partial<Product>[] {
  const items = (dto?.productsFeed?.products ?? []).map((dto: AliCatalogProduct) => {
    const id = dto?.id;
    const params: AliProductParams = {
      skuId: skuIdRegex.exec(dto?.productUrl)?.[1],
    };
    const product: Partial<Product> = {
      platform: APIPlatform.ALI,
      id,
      params,
      title: dto?.productTitle,
      brand: dto?.storeTitle,
      description: '',
      externalURL: `https://aliexpress.ru${dto?.productUrl}`,
      images: (dto?.imgGallery || [])
        .map((img: string, index: number) => {
          const image: Photo = {
            name: `product-ali-${id}-${index + 1}`,
            small: `https:${img}`,
            big: `https:${img.substring(0, img.lastIndexOf('_'))}`,
          };

          return image;
        }),
    };

    return product;
  });

  return items;
}
