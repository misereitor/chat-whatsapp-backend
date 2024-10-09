import { ChatMessage, CreateChat, SendMessage } from '../model/chat-model';
import { getCompanyById } from '../repository/company-repository';
import { Channel } from '../model/channel-model';
import { findAllMessageByConnectionAndSession } from '../repository/chat-repository';
import { connectToMongo } from '../config/mongo_db.conf';
import { getProfilePhoto, insertNewMenssage } from './webhook-service';

const { API_URL } = process.env;

export async function findAllMessageInDB(company_id: number) {
  try {
    const company = await getCompanyById(company_id);
    const chats = await getAllMessagesByConnection(company.channels);
    return chats;
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function sendMessage(message: SendMessage) {
  try {
    const response = await fetch(`${API_URL}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(message)
    });
    if (!response.ok) throw new Error('Erro ao enviar mensagem');
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function createChatService(chat: CreateChat) {
  try {
    const number = await checkNumberExist(chat.phoneNumber, chat.session);
    chat.phoneNumber = number.chatId;
    const newChat = await insertChat(chat);
    return newChat;
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function getAllMessagesByConnection(connection: Channel[]) {
  const chats: ChatMessage[] = [];
  try {
    for (const channel of connection) {
      const chat = (await findAllMessageByConnectionAndSession(
        channel.connection,
        channel.name
      )) as unknown as ChatMessage[];
      chats.push(...chat);
    }
    return chats;
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function checkNumberExist(number: string, session: string) {
  try {
    const response = await fetch(
      `${API_URL}/api/contacts/check-exists?phone=${number}&session=${session}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    );
    if (!response.ok) throw new Error('Número de telefone não disponível');
    const data = await response.json();
    if (data.numberExists) {
      return data;
    }
    throw new Error('Número de telefone não disponível');
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function insertChat(chat: CreateChat) {
  const chatExist = await findChatInDBByConectionAndSession(
    chat.connection,
    chat.session,
    chat.phoneNumber
  );
  if (chatExist) return chatExist;
  const profilePhoto = await getProfilePhoto(chat.session, chat.phoneNumber);
  const newChat = {
    contactId: chat.phoneNumber,
    connection: chat.connection,
    session: chat.session,
    phoneNumber: chat.phoneNumber,
    messages: [],
    _id: '',
    totalAttendances: 0,
    totalMessages: 0,
    contactName: '',
    connectionType: '',
    lastMessage: new Date().getTime(),
    photoURL: profilePhoto.profilePictureURL || ''
  };
  await insertNewMenssage(newChat);
  return newChat;
}

export async function findChatInDBByConectionAndSession(
  connection: string,
  session: string,
  contactId: string
) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('chat');

    const message = await dbMongo.findOne({
      connection,
      session,
      contactId
    });
    return message;
  } catch (error: any) {
    console.warn(error.message);
  }
}
