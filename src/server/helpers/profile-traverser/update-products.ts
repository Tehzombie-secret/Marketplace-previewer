import { ProductsSchema } from '../../services/mongodb/models/collection-schemas/products-schema.interface';
import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { caught } from '../caught/caught';
import { smartFetch } from '../smart-fetch';
import { TaskMark, TaskQueue } from '../task-queue';
import { updateStatus } from './update-status';

const retryMap = new Map<string, number>();

export async function updateProducts(mongoDB: MongoDBService): Promise<boolean> {
  const indexResult = await mongoDB.createIndexIfNone(MongoDBCollection.PRODUCTS, 'slug');
  if (!indexResult) {
    return false;
  }
  return new Promise(async (resolve) => {
    while (await mongoDB.size(MongoDBCollection.CATEGORIES)) {
      await fetchPack(mongoDB);
    }
    retryMap.clear();
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
        }).toString();
        const url = 'https://functions.yandexcloud.net/d4er1solcu4ou7maei00?' + params;
        while (true) {
          const [error, fetchResult] = await smartFetch(url);
          marker('fetch complete');
          if (error || fetchResult?.status !== 200) {
            const retryCount = retryMap.get(params) ?? 0;
            if (retryCount >= 5) {
              await mongoDB.deleteBy(MongoDBCollection.CATEGORIES, element);

              return 'blacklisted';
            }
            retryMap.set(params, (retryMap.get(params) ?? 0) + 1);

            return error
              ? `fetch failed internally: ${error.toString()}`
              : `fetch failed ${fetchResult?.status ?? 0}`;
          }
          // Add new products
          const [jsonError, products] = await caught(fetchResult?.json?.());
          if (!products?.length) {
            await mongoDB.delete(MongoDBCollection.CATEGORIES, 'slug', element.slug);
            blacklistSlugs.add(element.slug);

            return 'no items';
          }
          const validProducts = (products as ProductsSchema[])
            .filter((item) => (item.slug || item.parentId) && item.brand && item.name);
          const pushSuccessful = await mongoDB.set(MongoDBCollection.PRODUCTS, validProducts, 'slug');
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
