import { Photo } from '../../../../../models/photo/photo.interface';
import { Product } from '../../../../../models/product/product.interface';
import { APIPlatform } from '../../api-platform.enum';
import { AliProductGallery } from './ali-product-gallery.interface';

export interface AliProduct {
  id: string;
  gallery: AliProductGallery[];
  name: string;
  description: string;
  reviews: string;
  activeSkuId: string;
}

export function getProductFromAli(dto?: AliProduct | null): Partial<Product> {
  const product: Partial<Product> = {
    platform: APIPlatform.ALI,
    id: dto?.id,
    title: dto?.name,
    description: dto?.description,
    externalURL: `https://aliexpress.ru/item/${dto?.id}.html?sku_id=${dto?.activeSkuId}`,
    images: (dto?.gallery || [])
      .map((gallery: AliProductGallery, index: number) => {
        const image: Photo = {
          big: gallery?.imageUrl,
          small: gallery?.previewUrl,
          name: `product-ali-${dto?.id}-${index}`,
        };

        return image;
      }),
  };

  return product;
}
