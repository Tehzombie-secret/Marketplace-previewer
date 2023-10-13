import { Feedback } from '../../../../app/models/feedbacks/feedback.interface';
import { getUserFeedbackFromFeedbacksSchema } from '../../../../app/models/feedbacks/user-feedback.interface';
import { MongoDBCollection } from '../../../services/mongodb/models/mongo-db-collection.enum';
import { MongoDBService } from '../../../services/mongodb/mongodb.service';
import { FeedbackSearchResponse } from './models/feedback-search-response.interface';

export async function searchWBFeedbacks(mongoDB: MongoDBService, query: string | null, page?: string | number | null): Promise<FeedbackSearchResponse> {
  if ((query?.length ?? 0) < 2) {
    return {
      status: 400,
      error: {
        error: 'Query should be present and 3 letters long',
      },
    };
  }
  const result = await mongoDB.search(MongoDBCollection.FEEDBACKS, query || '', +(page || 1));
  const feedbacks: Partial<Feedback>[] = result
    .filter((item) => item.p?.length)
    .map((item) => getUserFeedbackFromFeedbacksSchema(item));

  return {
    status: 200,
    result: feedbacks,
  };
}
