import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();
const { MONGODB_URI } = process.env;
const clientMongoDB = new MongoClient(String(MONGODB_URI));
export async function findAllMessage(connection: string, session: string) {
  try {
    await clientMongoDB.connect();
    const dbMongo = clientMongoDB.db('chatbot').collection('chat');
    const chats = await dbMongo
      .find({ connection, session, inBot: false, active: true })
      .toArray();
    return chats;
  } catch (error: any) {
    console.warn(error.message);
  } finally {
    await clientMongoDB.close();
  }
}

export async function findAllMessageByUserAndDepartament(
  connection: string,
  session: string,
  user_id: number,
  departament_id: number
) {
  try {
    await clientMongoDB.connect();
    const dbMongo = clientMongoDB.db('chatbot').collection('chat');

    const query: any = {
      connection,
      session,
      inBot: false, // Sempre inBot deve ser false
      active: true // Sempre deve ser ativo
    };

    // Regras de filtragem para o departamento e usuário
    if (departament_id) {
      // Se o departamento for fornecido
      query.$and = [
        { departamentId: departament_id }, // Departamento deve corresponder
        { $or: [{ userId: user_id }, { userId: { $exists: false } }] } // Se for do mesmo usuário ou não existir userId
      ];
    } else if (user_id) {
      // Se não houver departamento, mas houver user_id
      query.userId = user_id;
    } else {
      // Se não houver nem departamento nem user_id
      query.$and = [
        { departamentId: { $exists: false } }, // Não deve ter departamento
        { userId: { $exists: false } } // Nem usuário
      ];
    }

    const chats = await dbMongo.find(query).toArray();
    return chats;
  } catch (error: any) {
    console.warn(error.message);
  } finally {
    await clientMongoDB.close();
  }
}
