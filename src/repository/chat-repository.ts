import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();
const { MONGODB_URI } = process.env;
const clientMongoDB = new MongoClient(String(MONGODB_URI));
export async function findAllMessageByConnectionAndSession(
  connection: string,
  session: string
) {
  try {
    await clientMongoDB.connect();
    const dbMongo = clientMongoDB.db('chatbot').collection('chat');
    const chats = await dbMongo.find({ connection, session }).toArray();
    return chats;
  } catch (error: any) {
    console.warn(error.message);
  } finally {
    await clientMongoDB.close();
  }
}
