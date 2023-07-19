import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { retryable } from '../retryable';
import { updateCategories } from './update-categories';

let traverseOngoing = false;

export async function startTraverse(mongoDB: MongoDBService): Promise<void> {
  if (traverseOngoing) {
    return;
  }
  traverseOngoing = true;
  const [queueError, queueStatus] = await mongoDB.readFirst(MongoDBCollection.TRAVERSE_STATUS);
  if (!queueStatus) {
    return;
  }
  const statusToTraverserStrategy: Record<TraverseStatus, () => (Promise<void> | void)> = {
    [TraverseStatus.CATEGORIES]: async () => {
      await retryable(updateCategories(mongoDB));
    },
    [TraverseStatus.PRODUCTS]: async () => {

    },
    [TraverseStatus.FEEDBACKS]: async () => {

    },
    [TraverseStatus.DONE]: () => {},
  };
  await statusToTraverserStrategy[queueStatus.status]?.();
  traverseOngoing = false;
}
