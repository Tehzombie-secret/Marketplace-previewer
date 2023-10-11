import { FeedbacksSchema } from '../../services/mongodb/models/collection-schemas/feedbacks-schema.interface';
import { ProductsSchema } from '../../services/mongodb/models/collection-schemas/products-schema.interface';
import { MongoDBCollection } from '../../services/mongodb/models/mongo-db-collection.enum';
import { TraverseStatus } from '../../services/mongodb/models/traverse-status.enum';
import { MongoDBService } from '../../services/mongodb/mongodb.service';
import { caught } from '../caught/caught';
import { smartFetch } from '../smart-fetch';
import { TaskMark, TaskQueue } from '../task-queue';
import { PartialFeedbacksSchema } from './models/partial-feedbacks-schema.interface';
import { updateStatus } from './update-status';

export async function updateFeedbacks(mongoDB: MongoDBService): Promise<boolean> {
  const idIndexResult = await mongoDB.createIndexIfNone(MongoDBCollection.FEEDBACKS, 'id');
  if (!idIndexResult) {
    return false;
  }
  const uidIndexResult = await mongoDB.createIndexIfNone(MongoDBCollection.FEEDBACKS, 'uId');
  if (!uidIndexResult) {
    return false;
  }
  const uwidIndexResult = await mongoDB.createIndexIfNone(MongoDBCollection.FEEDBACKS, 'uWId');
  if (!uwidIndexResult) {
    return false;
  }
  return new Promise(async (resolve) => {
    while (await mongoDB.size(MongoDBCollection.PRODUCTS)) {
      const result = await fetchPack(mongoDB);
      if (result) {
        break;
      }
    }
    const statusChangeResult = updateStatus(mongoDB, TraverseStatus.DONE);
    resolve(statusChangeResult);
  });
}

export async function fetchPack(mongoDB: MongoDBService): Promise<boolean> {
  return new Promise(async (resolve) => {
    const size = await mongoDB.size(MongoDBCollection.PRODUCTS);
    console.log('will fetch', size, 'products');
    const cursor = await mongoDB.readAll(MongoDBCollection.PRODUCTS);
    const pageQueue = new TaskQueue<string>(20);

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
        console.log(`Pack finished in`, Math.round(status.time / 1000), `s. Events: ${events}. Markers: ${markers}.`);
        if (status.results.every((item) => item?.startsWith('fetch failed 5')) && size <= 50) {
          resolve(true);
        } else {
          resolve(size <= 0);
        }
      }
    });

    let limit = 500;
    while (await cursor?.hasNext() && limit > 0) {
      const element = await cursor?.next();
      limit--;
      if (!element) {
        break;
      }
      pageQueue.add(`${element.slug}`, async ({ marker }) => {
        const params = new URLSearchParams({
          slug: `${element.parentId}`,
        });
        const url = 'https://functions.yandexcloud.net/d4e3id4kd5olr5krqa8j?' + params.toString();
        while (true) {
          const fetchResult = await smartFetch(null, url);
          marker('fetch complete');
          if (fetchResult?.status !== 200) {

            return `fetch failed ${fetchResult?.status ?? 0}`;
          }
          // Add new products
          const [jsonError, rawFeedbacks] = await caught(fetchResult?.json());
          if (!rawFeedbacks?.length) {
            if (element.parentId) {
              await mongoDB.delete(MongoDBCollection.PRODUCTS, 'parentId', element.parentId);
            } else {
              await mongoDB.delete(MongoDBCollection.PRODUCTS, 'slug', element.slug);
            }

            return 'no feedbacks';
          }
          const feedbacks = rawFeedbacks.map((item: PartialFeedbacksSchema) => mapProductFromFeedback(element, item));
          const pushSuccessful = await mongoDB.set(MongoDBCollection.FEEDBACKS, feedbacks, 'id');
          marker('db enrich');
          if (pushSuccessful) {
            if (element.parentId) {
              await mongoDB.delete(MongoDBCollection.PRODUCTS, 'parentId', element.parentId);
            } else {
              await mongoDB.delete(MongoDBCollection.PRODUCTS, 'slug', element.slug);
            }
          }

          return pushSuccessful ? 'success' : 'push unsuccessful';
        }
      });
    }
    pageQueue.finalize();
  });
}

function mapProductFromFeedback(product: ProductsSchema, feedback: PartialFeedbacksSchema): FeedbacksSchema {
  return {
    ...feedback,
    b: product.brand,
    n: product.name,
    pId: `${product.slug}`,
    ppId: `${product.parentId}`,
    f: false,
  };
}
