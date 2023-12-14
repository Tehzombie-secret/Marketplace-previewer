import { differenceInCalendarDays } from 'date-fns';
import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { timeout } from '../timeout';
import { updateStatus } from './update-status';

export async function checkNextLoop(mongoDB: MongoDBService): Promise<boolean> {
  const datesCursor = await mongoDB.readAll(MongoDBCollection.TRAVERSE_STATUS);
  const dates = await datesCursor?.toArray();
  const date = dates?.[0]?.date;
  const canCallNextLoop = date && differenceInCalendarDays(new Date(date), new Date()) > 14;
  if (canCallNextLoop) {
    const statusChangeResult = updateStatus(mongoDB, TraverseStatus.DONE);
    return statusChangeResult;
  } else {
    timeout(1000 * 60 * 10);
    return true;
  }
}
