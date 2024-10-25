import {
  CustomersMessage,
  CreateChat,
  InsertCustomer,
  Customer,
  Message
} from '../model/chat-model';
import { User } from '../model/user-model';
import { getChannelByConnectionAndSession } from '../repository/channel-repository';
import {
  createCustomer,
  getAllCustommerByUserAndDepartment,
  getCustomerByChannelAndChatId
} from '../repository/chat-repository';
import { getCompanyById } from '../repository/company-repository';
import { getUserById } from '../repository/user-repository';
import { getMessageByCustomer } from './message-service';

const { API_URL_WHATSAPP_NO_OFFICIAL, SECRET_AIP_WHATSAPP_NO_OFFICIAL } =
  process.env;

export async function findAllMessageInDB(company_id: number, user_id: any) {
  try {
    const companyAndUser = await checkPermissionUserChat(company_id, user_id);
    if (!companyAndUser) throw new Error('Usuário não tem permissão');
    const chats: CustomersMessage[] | undefined =
      await getAllChatsByCompanyForUser(companyAndUser.user);
    return chats;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createChatService(chat: CreateChat) {
  try {
    const channel = await getChannelByConnectionAndSession(
      chat.connection,
      chat.session
    );
    const numberExists = await checkNumberExist(chat.phoneNumber, chat.session);
    const chatExist = await getCustomerByChannelAndChatId(
      channel,
      numberExists.chatId
    );

    if (!channel) throw new Error('Canal não encontrado');
    if (!numberExists.numberExists)
      throw new Error('Número não está cadastrado no whatsapp');
    const profilePhoto = await getProfilePhoto(
      chat.session,
      numberExists.chatId
    );
    if (chatExist) throw new Error('Chat já existe'); //todo para verificar em quem o chat tá preso
    const newChat: InsertCustomer = {
      id: 0,
      chatId: numberExists.chatId,
      phoneNumber: chat.phoneNumber,
      totalAttendances: 0,
      totalMessages: 0,
      contactName: '',
      lastMessage: new Date().getTime(),
      photoURL: profilePhoto.profilePictureURL || '',
      inBot: false,
      active: true,
      dateCreateChat: new Date().getTime(),
      department_id: chat.departmentId,
      user_id: chat.attendantId,
      channel_id: channel.id,
      currentStage: 'service',
      currentQuestionId: 0,
      currentSegmentationId: 0,
      startedAt: 0
    };
    await createCustomer(newChat);
    return newChat;
  } catch (error: any) {
    console.warn(error.message);
    throw new Error(error.message);
  }
}

async function getAllChatsByCompanyForUser(user: User) {
  try {
    switch (user.role.id) {
      case 3:
        return await getAllChatsByUserAdmin(user);
      case 4:
        return await getAllChatsByUserSupervisor(user);
      case 5:
        return await getAllChatsByAttendantAndUser(user);
      default:
        throw new Error('Usuário não tem permissão');
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getAllChatsByAttendantAndUser(user: User) {
  try {
    const chats: CustomersMessage[] | undefined = [];
    const customers: Customer[] | undefined = [];
    for (const channel of user.company.channels) {
      for (const department of user.departments) {
        const customer = await getAllCustommerByUserAndDepartment(
          channel,
          user.id,
          department.id
        );
        customers.push(...customer);
      }
    }
    for (const customer of customers) {
      const messages: Message[] = [];
      const message = await getMessageByCustomer(customer);
      if (!message) continue;
      messages.push(...message);
      chats.push({
        ...customer,
        messages: messages
      });
    }
    return chats;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getAllChatsByUserSupervisor(user: User) {
  try {
    console.log(user);
    const chats: CustomersMessage[] | undefined = undefined;
    return chats;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getAllChatsByUserAdmin(user: User) {
  try {
    console.log(user);
    const chats: CustomersMessage[] | undefined = undefined;
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

export async function getProfilePhoto(session: string, contactid: string) {
  try {
    const response = await fetch(
      `${API_URL_WHATSAPP_NO_OFFICIAL}/api/contacts/profile-picture?contactId=${contactid}&session=${session}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Api-Key': String(SECRET_AIP_WHATSAPP_NO_OFFICIAL)
        }
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}
