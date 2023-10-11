import { readFile } from 'fs/promises';
import { Db, Document, FindCursor, MongoClient, MongoClientOptions, WithId } from 'mongodb';
import { join } from 'path';
import { format } from 'util';
import { emitErrorLog } from '../../../app/helpers/emit-error-log/emit-error-log';
import { ErrorReason } from '../../../app/helpers/emit-error-log/models/error-reason.enum';
import { caught } from '../../helpers/caught/caught';
import { Caught } from '../../helpers/caught/models/caught.type';
import { retryable } from '../../helpers/retryable';
import { CollectionToSchemaStrategy } from './constants/collection-to-schema-strategy';
import { Credentials } from './models/credentials.interface';
import { MongoDBCollection } from './models/mongo-db-collection.enum';

export class MongoDBService {
  private readonly dbName = 'feedbacks';
  private client: Db | null = null;

  public async size<T extends MongoDBCollection>(collection: T): Promise<number> {
    const client = await this.setupConnection();
    if (!client) {
      return -1;
    }
    const result = await client.collection(collection).estimatedDocumentCount();
    return result;
  }

  public async getIndexes<T extends MongoDBCollection>(
    collection: T
  ): Promise<Document[] | null> {
    const client = await this.setupConnection();
    if (!client) {
      return null;
    }
    const indexes = await client
      .collection<CollectionToSchemaStrategy[T]>(collection)
      .indexes();
    return indexes;
  }

  public async clearIndexes<T extends MongoDBCollection>(
    collection: T
  ): Promise<boolean> {
    const client = await this.setupConnection();
    if (!client) {
      return false;
    }
    const result = await client
      .collection<CollectionToSchemaStrategy[T]>(collection)
      .dropIndexes();
    return result;
  }

  public async createIndexIfNone<T extends MongoDBCollection>(
    collection: T,
    key: (keyof CollectionToSchemaStrategy[T]) | (keyof CollectionToSchemaStrategy[T])[],
  ): Promise<boolean> {
    const client = await this.setupConnection();
    if (!client) {
      return false;
    }
    const hasIndex = await client
      .collection<CollectionToSchemaStrategy[T]>(collection)
      .indexExists(Array.isArray(key) ? key.map((item) => String(item)) : String(key));
    if (!hasIndex) {
      await client
        .collection<CollectionToSchemaStrategy[T]>(collection)
        .createIndex(Array.isArray(key) ? key.map((item) => String(item)) : String(key), {
          background: true,
        });
    }
    return true;
  }

  public async clearTable<T extends MongoDBCollection>(collection: T): Promise<boolean> {
    const client = await this.setupConnection();
    if (!client) {
      return false;
    }
    const result = await client.collection<CollectionToSchemaStrategy[T]>(collection).deleteMany({});
    return result.acknowledged;
  }

  public async set<T extends MongoDBCollection>(
    collection: T,
    items: CollectionToSchemaStrategy[T][],
    key: keyof CollectionToSchemaStrategy[T],
  ): Promise<boolean> {
    const client = await this.setupConnection();
    if (!client) {
      return false;
    }
    if (!items.length) {
      return true;
    }
    const operations = items.map((item) => {
      return {
        updateOne: {
          filter: { [key]: item[key] },
          update: {
            $set: item,
          },
          upsert: true
        }
      };
    });
    const result = await client.collection(collection).bulkWrite(operations, { ordered: false });
    return result.isOk();
  }

  public async clearAndSet<T extends MongoDBCollection>(
    collection: T,
    items: CollectionToSchemaStrategy[T][],
  ): Promise<boolean> {
    const client = await this.setupConnection();
    if (!client) {
      return false;
    }
    const deleteResult = await client.collection(collection).deleteMany();
    if (!deleteResult.acknowledged) {
      return false;
    }
    if (!items.length) {
      return true;
    }
    const insertResult = await client.collection(collection).insertMany(items);
    return insertResult.acknowledged;
  }

  public async write<T extends MongoDBCollection, J extends keyof CollectionToSchemaStrategy[T]>(
    collection: T,
    item: CollectionToSchemaStrategy[T],
    key: J,
    value: CollectionToSchemaStrategy[T][J],
  ): Promise<boolean> {
    const client = await this.setupConnection();
    if (!client) {
      return false;
    }
    const result = await client.collection(collection).updateOne({ [key]: value }, { $set: item }, { upsert: true });
    return result.acknowledged;
  }

  public async read<T extends MongoDBCollection, J extends keyof CollectionToSchemaStrategy[T]>(
    collection: T,
    key: J,
    value: CollectionToSchemaStrategy[T][J],
  ): Promise<WithId<CollectionToSchemaStrategy[T]>[]> {
    const client = await this.setupConnection();
    if (!client) {
      return [];
    }
    const result = await client
      .collection<CollectionToSchemaStrategy[T]>(collection)
      .find({ [key]: value } as any)
      .toArray();

    return result;
  }

  public async readFirst<T extends MongoDBCollection, J extends keyof CollectionToSchemaStrategy[T]>(
    collection: T,
    excludeKey?: J,
    excludeValue?: CollectionToSchemaStrategy[T][J],
  ): Promise<Caught<WithId<CollectionToSchemaStrategy[T]> | null>> {
    const client = await this.setupConnection();
    return await retryable(
      client
        ?.collection<CollectionToSchemaStrategy[T]>(collection)
        ?.findOne(excludeKey && excludeValue ? { [excludeKey]: { $not: { $eq: excludeValue } } } as any : {})
    );
  }

  public async readAll<T extends MongoDBCollection>(
    collection: T,
  ): Promise<FindCursor<WithId<CollectionToSchemaStrategy[T]>> | null> {
    const client = await this.setupConnection();
    return client?.collection<CollectionToSchemaStrategy[T]>(collection)?.find() ?? null;
  }

  public async delete<T extends MongoDBCollection, J extends keyof CollectionToSchemaStrategy[T]>(
    collection: T,
    key: J,
    value: CollectionToSchemaStrategy[T][J],
  ): Promise<boolean> {
    const client = await this.setupConnection();
    const realCollection = client?.collection<CollectionToSchemaStrategy[T]>(collection);
    const result = await realCollection?.deleteOne({ [key]: value } as any);
    return result?.acknowledged ?? false;
  }

  private async setupConnection(): Promise<Db | null> {
    if (this.client) {
      return this.client;
    }

    // Read credentials
    const [credentialsError, credentials] = await this.getCredentials();
    if (!credentials || credentialsError) {
      emitErrorLog(ErrorReason.MONGO, credentialsError, 'mongo credentials');
      return null;
    }

    // Read certificate
    const [certificateError, certificate] = await this.getCertificate();
    if (!certificate || certificateError) {
      emitErrorLog(ErrorReason.MONGO, credentialsError, 'mongo certificate');
      return null;
    }

    // Compose connection options
    const dbHosts = ['rc1a-51txvghtskmztaap.mdb.yandexcloud.net:27018'];
    const url = format('mongodb://%s:%s@%s/', credentials.user, credentials.password, dbHosts.join(','));
    const options: MongoClientOptions = {
      tls: true,
      ca: certificate,
      authSource: this.dbName,
    };

    // Receive client
    const [connectionError, client] = await caught(MongoClient.connect(url, options));
    if (!client || connectionError) {
      emitErrorLog(ErrorReason.MONGO, connectionError, 'mongo connection');
      return null;
    }
    const db = client.db(this.dbName);
    this.client = db;
    return db;
  }

  private async getCredentials(): Promise<Caught<Credentials>> {
    if (process.env['MONGODB_USER'] && process.env['MONGODB_PASSWORD']) {
      return [null, {
        user: process.env['MONGODB_USER'],
        password: process.env['MONGODB_PASSWORD'],
      }];
    }

    const localPath = join(process.cwd(), '.mongodb/credentials.json');
    const [error, file] = await caught(readFile(localPath));
    if (file) {
      const localCredentialsString = file.toString('utf-8');
      try {
        const localCredentials = JSON.parse(localCredentialsString);
        return [null, localCredentials];
      } catch (e) {
        return [e, null];
      }
    }
    return [error, null];
  }

  private async getCertificate(): Promise<Caught<Buffer>> {
    if (process.env['MONGODB_CERT']) {
      return [null, Buffer.from(process.env['MONGODB_CERT'])];
    }
    const certificatePath = join(process.cwd(), '.mongodb/root.crt');
    return await caught(readFile(certificatePath));
  }

}
