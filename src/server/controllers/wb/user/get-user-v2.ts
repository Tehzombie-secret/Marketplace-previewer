import { getWBFeedbackImage } from '../../../../app/helpers/wb/get-wb-feedback-image';
import { getWBImage } from '../../../../app/helpers/wb/get-wb-image';
import { UserFeedback } from '../../../../app/models/feedbacks/user-feedback.interface';
import { Person } from '../../../../app/models/person/person.interface';
import { APIPlatform } from '../../../../app/services/api/models/api-platform.enum';
import { ImageSize } from '../../../models/image-size.enum';
import { FeedbacksSchema } from '../../../services/mongodb/models/collection-schemas/feedbacks-schema.interface';
import { MongoDBCollection } from '../../../services/mongodb/models/mongo-db-collection.enum';
import { MongoDBService } from '../../../services/mongodb/mongodb.service';
import { UserResponse } from './models/user-response.interface';

export async function getWBUserV2(mongoDB: MongoDBService, id: string, useGlobalId?: boolean): Promise<UserResponse> {
  const dbFeedbacks = typeof useGlobalId !== 'boolean'
    ? await fetchAllFeedbacks(mongoDB, id)
    : await mongoDB.read(MongoDBCollection.FEEDBACKS, useGlobalId ? 'uId' : 'uWId', id);
  const feedbacks = dbFeedbacks
    .map((item) => {
      const feedback: UserFeedback = {
        date: item.d,
        parentProductId: item.ppId || '',
        productId: item.pId || '',
        productBrand: item.b,
        productName: item.n,
        productPhoto: {
          big: getWBImage(item.pId, '1', ImageSize.BIG),
          small: getWBImage(item.pId, '1', ImageSize.SMALL),
          name: `product-${item.pId}-1`,
        },
        text: item.t,
        photos: item.p.map((photo: number, index: number) => ({
          small: getWBFeedbackImage(photo, ImageSize.SMALL),
          big: getWBFeedbackImage(photo, ImageSize.BIG),
          name: `feedback-${id}-${item.pId}-${index + 1}`,
        })),
      };

      return feedback;
    });
  const result: Partial<Person> = {
    platform: APIPlatform.WB,
    id,
    name: dbFeedbacks.find((item) => item.un)?.un ?? '',
    externalURL: '',
    photo: null,
    feedbacks,
    mergedPhotos: feedbacks.flatMap((item) => item.photos),
  };

  return {
    response: result,
    status: 200,
  };
}

async function fetchAllFeedbacks(mongoDB: MongoDBService, id: string): Promise<FeedbacksSchema[]> {
  const dbFeedbacks = [
    ...await mongoDB.read(MongoDBCollection.FEEDBACKS, 'uId', id),
    ...await mongoDB.read(MongoDBCollection.FEEDBACKS, 'uWId', id),
  ];
  const idToFeedbackMap = new Map<string, FeedbacksSchema>(dbFeedbacks.map((item) => [item.id, item]));
  const result = Array.from(idToFeedbackMap.values());
  return result;
}
