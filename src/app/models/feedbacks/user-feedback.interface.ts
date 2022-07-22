import { proxifyLink } from '../../helpers/proxify-link';
import { getWBProductCategoryId } from '../../helpers/wb/get-product-category-id';
import { WBFeedbackPhoto } from '../../services/wb-api/models/person/wb-feedback-photo.interface';
import { WBPersonFeedback } from '../../services/wb-api/models/person/wb-person-feedback.interface';
import { Photo } from '../photo/photo.interface';

export interface UserFeedback {
  productId: number;
  parentProductId: number;
  productBrand: string;
  productName: string;
  productPhoto: Photo;
  text: string;
  date: string;
  photos: Photo[];
}

export function getUserFeedback(dto?: WBPersonFeedback | null): Partial<UserFeedback> {
  const id = dto?.product?.cod;
  const category = getWBProductCategoryId(`${id}`);
  const productPhoto: Photo = {
    name: `product-${id}-1`,
    big: `https://images.wbstatic.net/big/new/${category}/${id}-1.jpg`,
    small: `https://images.wbstatic.net/tm/new/${category}/${id}-1.jpg`,
  };
  const item: Partial<UserFeedback> = {
    date: dto?.entity?.postDate,
    text: dto?.entity?.text,
    productId: dto?.product?.cod,
    parentProductId: dto?.product?.link,
    productBrand: dto?.product?.brand,
    productName: dto?.product?.name,
    productPhoto,
    photos: (dto?.entity?.photos || [])?.map((photoDTO: WBFeedbackPhoto, index: number) => {
      const photo: Photo = {
        name: `feedback-${dto?.entity?.userId}-${id}-${index + 1}`,
        small: photoDTO.previewPath ? proxifyLink(`https://feedbackphotos.wbstatic.net/${photoDTO.previewPath}`) : null,
        big: photoDTO.fullSizePath ? proxifyLink(`https://feedbackphotos.wbstatic.net/${photoDTO.fullSizePath}`) : null,
      };

      return photo;
    }),
  };

  return item;
}
