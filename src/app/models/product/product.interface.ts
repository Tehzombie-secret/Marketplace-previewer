import { environment } from '../../../environments/environment';
import { VendorPlatform } from '../../../server/models/image-platform.enum';
import { ImageSize } from '../../../server/models/image-size.enum';
import { WBProduct } from '../../services/wb-api/models/product/wb-product.interface';
import { WBSimilarProduct } from '../../services/wb-api/models/similar/wb-similar-product.interface';
import { Photo } from '../photo/photo.interface';

export interface Product {
  type: 'product';
  externalURL: string;
  parentId: number;
  id: number;
  brand: string;
  title: string;
  description: string;
  images: Photo[];
}

export function mapProduct(dto?: WBProduct | null): Partial<Product> {
  const id = dto?.nm_id;
  const item: Partial<Product> = {
    type: 'product',
    externalURL: `https://www.wildberries.ru/catalog/${id}/detail.aspx`,
    parentId: dto?.imt_id,
    id,
    brand: dto?.selling?.brand_name,
    title: dto?.imt_name,
    description: dto?.description,
    images: new Array(dto?.media?.photo_count ?? 0)
      .fill(null)
      .map((_: void, index: number) => {
        const image: Photo = {
          name: `product-${id}-${index + 1}`,
          small: `${environment.host}/api/${VendorPlatform.WB}/image/${ImageSize.SMALL}/${id}/${index + 1}.jpg`,
          big: `${environment.host}/api/${VendorPlatform.WB}/image/${ImageSize.BIG}/${id}/${index + 1}.jpg`,
        };

        return image;
      }),
  };

  return item;
}

export function mapProductFromSimilar(dto?: WBSimilarProduct | null): Partial<Product> {
  const id = dto?.id;
  const item: Partial<Product> = {
    id,
    title: dto?.name,
    brand: dto?.brand,
    description: '',
    externalURL: `https://www.wildberries.ru/catalog/${id}/detail.aspx`,
    parentId: dto?.root,
    images: new Array(dto?.pics ?? 0)
      .fill(null)
      .map((_: void, index: number) => {
        const image: Photo = {
          name: `product-${id}-${index + 1}`,
          small: `${environment.host}/api/${VendorPlatform.WB}/image/${ImageSize.SMALL}/${id}/${index + 1}.jpg`,
          big: `${environment.host}/api/${VendorPlatform.WB}/image/${ImageSize.BIG}/${id}/${index + 1}.jpg`,
        };

        return image;
      }),

  };

  return item;
}
