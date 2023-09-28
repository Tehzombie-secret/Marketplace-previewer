import { interval, startWith } from 'rxjs';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { startTraverse } from './start-traverse';

export function listenOnTraverseDemands(mongoDB: MongoDBService): void {
  interval(60 * 1000) // Every minute
    .pipe(
      startWith(1),
    )
    .subscribe(async () => {
      await startTraverse(mongoDB);
    });
}
