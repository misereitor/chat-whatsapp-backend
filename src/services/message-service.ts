import { connectToMongo } from '../config/mongo_db.conf';
import {
  InsertCustomer,
  InsertMessage,
  SendMessage
} from '../model/chat-model';

const {
  API_URL_WHATSAPP_NO_OFFICIAL,
  MONGO_DB,
  SECRET_AIP_WHATSAPP_NO_OFFICIAL
} = process.env;

export async function insertNewMessageByCustomer(message: InsertMessage) {
  try {
    const mongoClient = await connectToMongo();
    const dbMessages = mongoClient.db(MONGO_DB).collection('messages');
    await dbMessages.insertOne({
      ...message
    });
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function sendMessage(message: SendMessage) {
  try {
    const response = await fetch(
      `${API_URL_WHATSAPP_NO_OFFICIAL}/api/sendText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Api-Key': String(SECRET_AIP_WHATSAPP_NO_OFFICIAL)
        },
        body: JSON.stringify(message)
      }
    );
    if (!response.ok) throw new Error('Erro ao enviar mensagem');
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function optionError(customer: InsertCustomer, message: string) {
  const send: SendMessage = {
    chatId: customer.contactId,
    text: message,
    session: customer.session
  };
  await sendMessage(send);
}
