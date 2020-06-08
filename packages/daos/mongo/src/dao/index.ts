import path from 'path';
import {
  Db,
  InsertOneWriteOpResult,
  MongoClient,
  UpdateWriteOpResult,
  FindOneOptions,
  DeleteWriteOpResultObject,
} from 'mongodb';

class MongoDao {
  mongoClient: MongoClient
  db: Db

  constructor() {
    this.mongoClient = null;
    this.db = null;
  }

  checkConnection() {
    if (this.mongoClient === null) {
      throw new Error('Mongo connection not initialized');
    }
  }

  async closeConnection() {
    if (this.mongoClient !== null) {
      await this.mongoClient.close();
    }
  }

  async openConnection(context?: AWSLambda.Context) {
    if (context) {
      context.callbackWaitsForEmptyEventLoop = false;
    }
    try {
      this.checkConnection();
      return this.mongoClient;
    } catch (e) {
      const config = require(path.join(process.cwd(), 'env.json'));
      const uri = config?.mongo?.uri ?? null;
      if (uri === null) {
        throw new Error('No mongo configuration found in env.json');
      }
      this.mongoClient = await MongoClient.connect(config.mongo.uri);
      this.db = this.mongoClient.db();
    }
  }

  async findOne(collectionName: string, filters, options?): Promise<any> {
    this.checkConnection();
    return this.db.collection(collectionName).findOne(filters, options);
  }

  async find(collectionName: string, query, options?: FindOneOptions): Promise<any> {
    this.checkConnection();
    return this.db.collection(collectionName).find(query, options).toArray();
  }

  async insertOne(collectionName: string, object): Promise<InsertOneWriteOpResult<null>> {
    this.checkConnection();
    return this.db.collection(collectionName).insertOne(object);
  }

  async updateOne(collectionName: string, filter, object): Promise<UpdateWriteOpResult> {
    this.checkConnection();
    return this.db.collection(collectionName).updateOne(filter, object);
  }

  async deleteOne(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
    this.checkConnection();
    return this.db.collection(collectionName).deleteOne(filter);
  }
}

const mongoDao = new MongoDao();

export default mongoDao;

export {
  MongoDao,
};
