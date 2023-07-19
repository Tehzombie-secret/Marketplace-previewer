import { readFile } from 'fs/promises';
import { Db, Document, MongoClient, MongoClientOptions, WithId } from 'mongodb';
import { join } from 'path';
import { format } from 'util';
import { emitErrorLog } from '../../../app/helpers/emit-error-log/emit-error-log';
import { ErrorReason } from '../../../app/helpers/emit-error-log/models/error-reason.enum';
import { caught } from '../../helpers/caught/caught';
import { Caught } from '../../helpers/caught/models/caught.type';
import type { CollectionToSchemaStrategy } from './constants/collection-to-schema-strategy';
import { Credentials } from './models/credentials.interface';
import { MongoDBCollection } from './models/mongo-db-collection.enum';

export class MongoDBService {
  private readonly dbName = 'feedbacks';
  private client: Db | null = null;

  public async set<T extends MongoDBCollection>(
    collection: T,
    items: CollectionToSchemaStrategy[T][],
    key: keyof CollectionToSchemaStrategy[T],
  ): Promise<boolean> {
    const client = await this.setupConnection();
    if (!client) {
      return false;
    }
    const operations = items.map((item) => {
      return {
        updateOne: {
          filter: { [key]: item[key] },
          update: {
            $set: items,
          },
          upsert: true
        }
      };
    })
    const result = await client.collection(collection).bulkWrite(operations, { ordered: false });
    return result.isOk();
  }

  public async readFirst<T extends MongoDBCollection>(collection: T): Promise<Caught<WithId<CollectionToSchemaStrategy[T]> | null>> {
    const client = await this.setupConnection();
    return await caught(client?.collection<CollectionToSchemaStrategy[T]>(collection)?.findOne({}));
  }

  private async setupConnection(): Promise<Db | null> {
    if (this.client) {
      return this.client;
    }
    // Read local credentials
    const [credentialsError, credentials] = await this.getCredentials();
    if (!credentials || credentialsError) {
      emitErrorLog(ErrorReason.MONGO, credentialsError, 'mongo credentials');
      return null;
    }

    // Read certificate
    const certificatePath = join(process.cwd(), '.mongodb/root.crt');
    const [certificateError, certificate] = await caught(readFile(certificatePath));
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
    console.log(options, url);

    // Receive client
    const [connectionError, client] = await caught(MongoClient.connect(url, options));
    if (!client || connectionError) {
      emitErrorLog(ErrorReason.MONGO, connectionError, 'mongo connection');
      return null;
    }
    const db = client.db(this.dbName);
    return db;
  }

  private async getCredentials(): Promise<Caught<Credentials>> {
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

}
