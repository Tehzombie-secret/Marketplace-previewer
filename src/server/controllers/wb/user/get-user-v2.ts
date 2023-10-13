import { getUserFeedbackFromFeedbacksSchema, UserFeedback } from '../../../../app/models/feedbacks/user-feedback.interface';
import { Person } from '../../../../app/models/person/person.interface';
import { APIPlatform } from '../../../../app/services/api/models/api-platform.enum';
import { FeedbacksSchema } from '../../../services/mongodb/models/collection-schemas/feedbacks-schema.interface';
import { MongoDBCollection } from '../../../services/mongodb/models/mongo-db-collection.enum';
import { MongoDBService } from '../../../services/mongodb/mongodb.service';
import { UserResponse } from './models/user-response.interface';

export async function getWBUserV2(mongoDB: MongoDBService, id: string, useGlobalId?: boolean): Promise<UserResponse> {
  const dbFeedbacks = typeof useGlobalId !== 'boolean'
    ? await fetchAllFeedbacks(mongoDB, id)
    : await mongoDB.read(MongoDBCollection.FEEDBACKS, useGlobalId ? 'uId' : 'uWId', id);
  const feedbacks: Partial<UserFeedback>[] =
    dbFeedbacks.map((item: FeedbacksSchema) => getUserFeedbackFromFeedbacksSchema(item));
  const result: Partial<Person> = {
    platform: APIPlatform.WB,
    id,
    name: dbFeedbacks.find((item) => item.un)?.un ?? '',
    externalURL: '',
    photo: null,
    feedbacks,
    mergedPhotos: feedbacks.flatMap((item) => item.photos ?? []),
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
