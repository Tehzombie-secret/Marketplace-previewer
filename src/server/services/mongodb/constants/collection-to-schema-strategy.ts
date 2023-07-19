import { CategoriesSchema } from '../models/collection-schemas/categories-schema.interface';
import { TraverseStatusSchema } from '../models/collection-schemas/traverse-status-schema.interface';
import { MongoDBCollection } from '../models/mongo-db-collection.enum';

export class CollectionToSchemaStrategy implements Record<MongoDBCollection, Object> {
  [MongoDBCollection.CATEGORIES]!: CategoriesSchema;
  [MongoDBCollection.TRAVERSE_STATUS]!: TraverseStatusSchema;
}
