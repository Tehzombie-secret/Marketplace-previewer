import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { retryable } from '../retryable';

export async function updateProducts(mongoDB: MongoDBService): Promise<void> {
  let category;
  do {
    const [error, result] = await retryable(mongoDB.readFirst(MongoDBCollection.CATEGORIES));
    if (error) {
      return;
    }


  } while (category);
}
