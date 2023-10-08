import { ImageSize } from '../../../server/models/image-size.enum';
import { proxifyLink } from '../../helpers/proxify-link';
import { getWBImage } from '../../helpers/wb/get-wb-image';
import { getWBProductURL } from '../../helpers/wb/get-wb-product-url';
import { APIPlatform } from '../../services/api/models/api-platform.enum';
import { WBProduct } from '../../services/api/models/wb/product/wb-product.interface';
import { WBSimilarProduct } from '../../services/api/models/wb/similar/wb-similar-product.interface';
import { WBSimilar } from '../../services/api/models/wb/similar/wb-similar.interface';
import { Photo } from '../photo/photo.interface';

export interface Product {
  platform: APIPlatform;
  externalURL: string | null;
  parentId: number;
  id: string;
  brand: string;
  title: string;
  description: string;
  images: Photo[];
}

export function mapProductFromWB(dto?: WBProduct | null): Partial<Product> {
  const id = dto?.nm_id;
  const item: Partial<Product> = {
    platform: APIPlatform.WB,
    externalURL: getWBProductURL(id),
    parentId: dto?.imt_id,
    id: `${id}`,
    brand: dto?.selling?.brand_name,
    title: dto?.imt_name,
    description: dto?.description,
    images: new Array(dto?.media?.photo_count ?? 0)
      .fill(null)
      .map((_: void, index: number) => {
        const image: Photo = {
          name: `product-${id}-${index + 1}`,
          small: proxifyLink(getWBImage(id ?? 0, index + 1, ImageSize.SMALL)),
          big: proxifyLink(getWBImage(id ?? 0, index + 1, ImageSize.BIG)),
        };

        return image;
      }),
  };

  return item;
}

export function mapProductsFromSimilarWB(dto?: WBSimilar | null, referenceId?: string | number | null): Partial<Product>[] {
  const idList = new Set<number>();
  const items: Partial<Product>[] = [];
  (dto?.data?.products ?? []).forEach((dto: WBSimilarProduct) => {
    const id = dto?.id;
    const product: Partial<Product> = {
      platform: APIPlatform.WB,
      id: `${id}`,
      title: dto?.name,
      brand: dto?.brand,
      description: '',
      externalURL: getWBProductURL(id),
      parentId: dto?.root,
      images: new Array(dto?.pics ?? 0)
        .fill(null)
        .map((_: void, index: number) => {
          const image: Photo = {
            name: `product-${id}-${index + 1}`,
            small: proxifyLink(getWBImage(id ?? 0, index + 1, ImageSize.SMALL)),
            big: proxifyLink(getWBImage(id ?? 0, index + 1, ImageSize.BIG)),
          };

          return image;
        }),

    };
    if (`${product.id}` === `${referenceId}`) {

      return;
    }
    if (!product.parentId || idList.has(product.parentId)) {

      return;
    }
    items.push(product);
    idList.add(product.parentId);
  });

  return items;
}
