import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';

export async function updateStatus(mongoDB: MongoDBService, status: TraverseStatus): Promise<boolean> {
  return await mongoDB.write(
    MongoDBCollection.TRAVERSE_STATUS,
    { status, key: 'status', date: new Date().toISOString() },
    'key',
    'status'
  );
}
