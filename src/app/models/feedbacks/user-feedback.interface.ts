import { ImageSize } from '../../../server/models/image-size.enum';
import { FeedbacksSchema } from '../../../server/services/mongodb/models/collection-schemas/feedbacks-schema.interface';
import { proxifyLink } from '../../helpers/proxify-link';
import { getWBProductCategoryId } from '../../helpers/wb/get-product-category-id';
import { getWBFeedbackImage } from '../../helpers/wb/get-wb-feedback-image';
import { getWBImage } from '../../helpers/wb/get-wb-image';
import { WBFeedbackPhoto } from '../../services/api/models/wb/person/wb-feedback-photo.interface';
import { WBPersonFeedback } from '../../services/api/models/wb/person/wb-person-feedback.interface';
import { Photo } from '../photo/photo.interface';

/** Feedback with user information */
export interface UserFeedback {
  productId: string;
  parentProductId: string;
  productBrand: string;
  productName: string;
  productPhoto: Photo;
  text: string;
  date: string;
  name: string;
  userId: string;
  userWId: string;
  photos: Photo[];
}

export function getUserFeedbackFromWB(dto?: WBPersonFeedback | null): Partial<UserFeedback> {
  const id = dto?.product?.cod;
  const category = getWBProductCategoryId(`${id}`);
  const productPhoto: Photo = {
    name: `product-${id}-1`,
    big: proxifyLink(getWBImage(id, 1, ImageSize.BIG)),
    small: proxifyLink(getWBImage(id, 1, ImageSize.SMALL)),
  };
  const item: Partial<UserFeedback> = {
    userId: dto?.entity?.userId ? `${dto.entity.userId}` : '',
    userWId: '',
    date: dto?.entity?.postDate,
    text: dto?.entity?.text,
    name: dto?.entity?.userName,
    productId: `${dto?.product?.cod ?? ''}`,
    parentProductId: `${dto?.product?.link ?? ''}`,
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

export function getUserFeedbackFromFeedbacksSchema(dto?: FeedbacksSchema): Partial<UserFeedback> {
  const feedback: UserFeedback = {
    userId: dto?.uId ?? '',
    userWId: dto?.uWId ?? '',
    date: dto?.d ?? new Date().toISOString(),
    parentProductId: dto?.ppId || '',
    productId: dto?.pId || '',
    productBrand: dto?.b ?? '',
    productName: dto?.n ?? '',
    productPhoto: {
      big: getWBImage(dto?.pId, '1', ImageSize.BIG),
      small: getWBImage(dto?.pId, '1', ImageSize.SMALL),
      name: `product-${dto?.pId}-1`,
    },
    name: dto?.un || 'Без имени',
    text: dto?.t ?? '',
    photos: (dto?.p ?? []).map((photo: number, index: number) => ({
      small: proxifyLink(getWBFeedbackImage(photo, ImageSize.SMALL)),
      big: proxifyLink(getWBFeedbackImage(photo, ImageSize.BIG)),
      name: `feedback-${dto?.uId || dto?.uWId}-${dto?.pId}-${index + 1}`,
    })),
  };

  return feedback;
}
