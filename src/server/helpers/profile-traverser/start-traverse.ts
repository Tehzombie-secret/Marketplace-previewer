import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { updateCategories } from './update-categories';
import { updateFeedbacks } from './update-feedbacks';
import { updateProducts } from './update-products';

let traverseOngoing = false;

export async function startTraverse(mongoDB: MongoDBService): Promise<void> {
  if (traverseOngoing) {
    return;
  }
  traverseOngoing = true;

  const [queueError, queueStatus] = await mongoDB.readFirst(MongoDBCollection.TRAVERSE_STATUS);
  if (queueError) {
    return;
  }
  console.log('got status', queueStatus?.status);
  const statusToTraverserStrategy: Record<TraverseStatus, () => (Promise<void> | void)> = {
    [TraverseStatus.CATEGORIES]: async () => {
      console.log('update: categories');
      await updateCategories(mongoDB);
    },
    [TraverseStatus.PRODUCTS]: async () => {
      console.log('update: products');
      await updateProducts(mongoDB);
    },
    [TraverseStatus.FEEDBACKS]: async () => {
      console.log('update: feedbacks');
      await updateFeedbacks(mongoDB);
    },
    [TraverseStatus.DONE]: async () => {
      await updateCategories(mongoDB);
    },
  };
  await statusToTraverserStrategy[queueStatus?.status ?? TraverseStatus.CATEGORIES]?.();
  traverseOngoing = false;
}
