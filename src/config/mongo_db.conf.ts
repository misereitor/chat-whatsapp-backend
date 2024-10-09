import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();

const { MONGODB_URI } = process.env;
let clientMongoDB: MongoClient | null = null;

export async function connectToMongo() {
  if (!clientMongoDB) {
    clientMongoDB = new MongoClient(String(MONGODB_URI));
    await clientMongoDB.connect();
  }
  return clientMongoDB;
}

export async function closeMongoConnection() {
  if (clientMongoDB) {
    await clientMongoDB.close();
    clientMongoDB = null;
  }
}
