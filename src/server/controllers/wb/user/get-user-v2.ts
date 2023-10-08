import { UserFeedback } from '../../../../app/models/feedbacks/user-feedback.interface';
import { Person } from '../../../../app/models/person/person.interface';
import { APIPlatform } from '../../../../app/services/api/models/api-platform.enum';
import { MongoDBCollection } from '../../../services/mongodb/models/mongo-db-collection.enum';
import { MongoDBService } from '../../../services/mongodb/mongodb.service';
import { UserResponse } from './models/user-response.interface';

export async function getWBUserV2(mongoDB: MongoDBService, id: string): Promise<UserResponse> {
  const dbFeedbacks = await mongoDB.read(MongoDBCollection.FEEDBACKS, 'id', id);
  const feedbacks = dbFeedbacks
    .sort((a, b) => a.o && b.o ? 0 : (a.o ? 1 : -1))
    .map((item) => {
      const feedback: UserFeedback = {
        date: item.d,
        parentProductId: item.ppId,
        productId: item.pId,
        productBrand: item.b,
        productName: item.n,
        productPhoto: {
          big: item.pp,
          small: item.pp,
          name: `product-${item.pId}`,
        },
        text: item.t,
        photos: item.ps.map((small: string, index: number) => ({
          small,
          big: item.pl[index],
          name: `feedback-${id}-${item.pId}-${index + 1}`,
        })),
      };

      return feedback;
    });
  const result: Partial<Person> = {
    platform: APIPlatform.WB,
    id: +id,
    country: '',
    name: '',
    externalURL: '',
    photo: '',
    feedbacks,
    mergedPhotos: feedbacks.flatMap((item) => item.photos),
  };

  return {
    response: result,
    status: 200,
  };
}
