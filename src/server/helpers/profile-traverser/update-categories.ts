import { getCategoriesList } from '../../controllers/wb/categories-list/get-categories-list';
import { FlatCategory } from '../../controllers/wb/categories-list/models/flat-category.interface';
import { CategoriesSchema } from '../../services/mongodb/models/collection-schemas/categories-schema.interface';
import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { updateStatus } from './update-status';

export async function updateCategories(mongoDB: MongoDBService): Promise<boolean> {
  const indexResult = await mongoDB.createIndexIfNone(MongoDBCollection.CATEGORIES, 'id');
  if (!indexResult) {
    return false;
  }
  const categoriesResponse = await getCategoriesList(false);
  if (!categoriesResponse.result?.length) {
    return false;
  }
  const categoriesObjects: CategoriesSchema[] = categoriesResponse.result.flatMap((item: FlatCategory) =>
    new Array(50).fill(0).map((_, index: number) => ({
      id: `${item.shard}~~~${index}`,
      slug: item.slug,
      shard: item.shard,
      query: item.query,
      page: `${index}`,
    }))
  );
  const insertResult = await mongoDB.clearAndSet(MongoDBCollection.CATEGORIES, categoriesObjects);
  if (!insertResult) {
    console.log('failed to update categories');
    return false;
  }
  const statusChangeResult = updateStatus(mongoDB, TraverseStatus.PRODUCTS);

  return statusChangeResult;
}
