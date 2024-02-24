import { interval, startWith } from 'rxjs';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { startTraverse } from './start-traverse';

export function listenOnTraverseDemands(mongoDB: MongoDBService, startWithStatus?: TraverseStatus): void {
  let started = false;
  interval(60 * 1000) // Every minute
    .pipe(
      startWith(1),
    )
    .subscribe(async () => {
      if (!started && startWithStatus) {
        started = true;
        await startTraverse(mongoDB, startWithStatus);
      } else {
        await startTraverse(mongoDB);
      }
    });
}
