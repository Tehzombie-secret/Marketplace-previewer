import { getCategoriesList } from '../../controllers/wb/categories-list/get-categories-list';
import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { updateStatus } from './update-status';

export async function updateCategories(mongoDB: MongoDBService): Promise<boolean> {
  const categoriesResponse = await getCategoriesList();
  if (!categoriesResponse.slugs?.length) {
    return false;
  }
  const categoriesObjects = categoriesResponse.slugs.map((slug) => ({ slug }));
  const insertResult = await mongoDB.set(MongoDBCollection.CATEGORIES, categoriesObjects, 'slug');
  if (!insertResult) {
    return false;
  }
  const statusChangeResult = updateStatus(mongoDB, TraverseStatus.PRODUCTS);
  return statusChangeResult;
}
