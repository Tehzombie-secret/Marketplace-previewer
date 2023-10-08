import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { caught } from '../caught/caught';
import { smartFetch } from '../smart-fetch';
import { TaskMark, TaskQueue } from '../task-queue';
import { updateStatus } from './update-status';

export async function updateProducts(mongoDB: MongoDBService): Promise<boolean> {
  const indexResult = await mongoDB.createIndexIfNone(MongoDBCollection.PRODUCTS, 'slug');
  if (!indexResult) {
    return false;
  }
  return new Promise(async (resolve) => {
    while (await mongoDB.size(MongoDBCollection.CATEGORIES)) {
      await fetchPack(mongoDB);
    }
    const statusChangeResult = updateStatus(mongoDB, TraverseStatus.FEEDBACKS);
    resolve(statusChangeResult);
  });
}

async function fetchPack(mongoDB: MongoDBService): Promise<void> {
  return new Promise(async (resolve) => {
    const size = await mongoDB.size(MongoDBCollection.CATEGORIES);
    console.log('will fetch', size, 'pageable categories');
    const cursor = await mongoDB.readAll(MongoDBCollection.CATEGORIES);
    const pageQueue = new TaskQueue<string>(20);
    const blacklistSlugs = new Set<string>();

    // Log
    pageQueue.listenQueueChanges((status) => {
      if (status.status === 'COMPLETE') {
        const markersRecord = status.markers.reduce((acc: Record<string, number[]>, curr: TaskMark) => {
          return {
            ...acc,
            [curr.name]: (acc[curr.name] ?? []).concat([curr.duration]),
          };
        }, {} as Record<string, number[]>);
        const markers = Object.entries(markersRecord).map(([key, value]) =>
          `${key}: ${Math.round(value.reduce((acc: number, curr: number) => acc + curr, 0) / value.length)}ms`
        ).join(', ');
        const eventsRecord = status.results.reduce((acc: Record<string, number>, curr: string | undefined) => {
          if (!curr) {
            return acc;
          }
          return {
            ...acc,
            [curr]: (acc[curr] ?? 0) + 1,
          };
        }, {} as Record<string, number>);
        const events = Object.entries(eventsRecord).map(([key, value]) => `${key}: ${value} times`).join(', ');
        console.log(`Pack finished in`, status.time, `ms. Events: ${events}. Markers: ${markers}`);
      }
    });

    let limit = 300;
    while (await cursor?.hasNext() && limit > 0) {
      const element = await cursor?.next();
      limit--;
      if (!element) {
        break;
      }
      pageQueue.add(element.id, async ({ marker }) => {
        if (blacklistSlugs.has(element.slug)) {
          return 'skip';
        }
        const params = new URLSearchParams({
          shard: element.shard,
          query: element.query,
          page: element.page,
        });
        const url = 'https://functions.yandexcloud.net/d4er1solcu4ou7maei00?' + params.toString();
        while (true) {
          const fetchResult = await smartFetch(null, url);
          marker('fetch complete');
          if (fetchResult?.status !== 200) {

            return `fetch failed ${fetchResult?.status ?? 0}`;
          }
          // Add new products
          const [jsonError, products] = await caught(fetchResult?.json());
          if (!products?.length) {
            await mongoDB.delete(MongoDBCollection.CATEGORIES, 'slug', element.slug);
            blacklistSlugs.add(element.slug);

            return 'no items';
          }
          const pushSuccessful = await mongoDB.set(MongoDBCollection.PRODUCTS, products, 'slug');
          marker('db enrich');
          if (pushSuccessful) {
            await mongoDB.delete(MongoDBCollection.CATEGORIES, 'id', element.id);
          }

          return pushSuccessful ? 'success' : 'push unsuccessful';
        }
      });
    }
    pageQueue.finalize(async () => {
      resolve();
    });
  });
}
