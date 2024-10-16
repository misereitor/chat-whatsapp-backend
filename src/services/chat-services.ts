import { BotState, CustomersMessage, CreateChat } from '../model/chat-model';
import { getCompanyById } from '../repository/company-repository';
import {
  findAllMessage,
  findAllMessageByUserAnddepartment
} from '../repository/chat-repository';
import { connectToMongo } from '../config/mongo_db.conf';
import { getUserById } from '../repository/user-repository';
import { Company } from '../model/company-model';
import { User } from '../model/user-model';

const { API_URL_WHATSAPP_NO_OFFICIAL, SECRET_AIP_WHATSAPP_NO_OFFICIAL } =
  process.env;

export async function findAllMessageInDB(company_id: number, user_id: any) {
  try {
    const companyAndUser = await checkPermissionUserChat(company_id, user_id);
    if (!companyAndUser) throw new Error('Usuário não tem permissão');
    const chats: CustomersMessage[] = await getAllMessagesByConnection(
      companyAndUser.company,
      companyAndUser.user
    );

    return chats;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createChatService(chat: CreateChat) {
  try {
    const number = await checkNumberExist(chat.phoneNumber, chat.session);
    chat.phoneNumber = number.chatId;
    const newChat = await insertChat(chat);
    return newChat;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getAllMessagesByConnection(company: Company, user: User) {
  const chats: CustomersMessage[] = [];
  try {
    if (user.role.id === 3 || user.role.id === 4) {
      for (const channel of company.channels) {
        const chat = (await findAllMessage(
          channel.connection,
          channel.name
        )) as unknown as CustomersMessage[];
        chats.push(...chat);
      }
    } else if (user.role.id === 5) {
      for (const channel of company.channels) {
        for (const department of user.departments) {
          const chat = (await findAllMessageByUserAnddepartment(
            channel.connection,
            channel.name,
            user.id,
            department.id
          )) as unknown as CustomersMessage[];
          chats.push(...chat);
        }
      }
    }
    return chats;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function checkNumberExist(number: string, session: string) {
  try {
    const response = await fetch(
      `${API_URL_WHATSAPP_NO_OFFICIAL}/api/contacts/check-exists?phone=${number}&session=${session}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Api-Key': String(SECRET_AIP_WHATSAPP_NO_OFFICIAL)
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
    throw new Error(error.message);
  }
}

async function insertChat(chat: CreateChat) {
  const chatExist = await findChatInDBByConectionAndSession(
    chat.connection,
    chat.session,
    chat.phoneNumber
  );
  if (chatExist) return chatExist;
  const botState: BotState = {
    currentStage: '',
    currentQuestionId: 0,
    currentSegmentationId: 0,
    startedAt: 0,
    lastInteraction: 0
  };
  //const profilePhoto = await getProfilePhoto(chat.session, chat.phoneNumber);
  const profilePhoto = { profilePictureURL: 'asdasd' };
  const newChat: CustomersMessage = {
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
    photoURL: profilePhoto.profilePictureURL || '',
    inBot: false,
    active: true,
    dateCreateChat: new Date().getTime(),
    departmentId: chat.departmentId,
    userId: chat.userId,
    botState
  };
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
    throw new Error(error.message);
  }
}

async function checkPermissionUserChat(company_id: number, user_id: number) {
  try {
    const user = await getUserById(user_id);
    const company = await getCompanyById(company_id);
    if (user.company.id !== company.id) throw new Error('Sem permissão');
    return { user, company };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
