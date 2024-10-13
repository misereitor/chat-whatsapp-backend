import {
  BotState,
  ChatMessage,
  InsertChatMessage,
  SendMessage,
  SegmentationInfo
} from '../model/chat-model';
import { WebhookMessage } from '../model/webhook-model';
import { replaceMessage } from '../util/replaceMessage';
import { config } from 'dotenv';
//import { io } from '../app';
import { connectToMongo } from '../config/mongo_db.conf';
import { getChannelByCompanyIdAndConnection } from '../repository/channel-repository';
import { getAllBotsByChannelId } from '../repository/bot-repository';
import { sendMessage } from './chat-services';
import { Bot } from '../model/bot-model';
import { PushOperator } from 'mongodb';

config();
const { API_URL } = process.env;

export async function botInteraction(message: WebhookMessage, type: number) {
  let messageFiltred: InsertChatMessage;
  if (type === 0) {
    messageFiltred = replaceMessage(message);
    if (messageFiltred.messages[0].fromMe) {
      await insertMenssageAndUpdateChatByContactIDAndSession(messageFiltred);
      return;
    }
    await insertNewMessageClientContact(messageFiltred);
  }
}

async function findClientInDBByConectionAndSession(
  connection: string,
  session: string,
  contactId: string
) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('chat');

    const message = await dbMongo.findOne(
      {
        connection,
        session,
        contactId
      },
      {
        projection: {
          messages: { $slice: 1 }
        }
      }
    );
    return message as ChatMessage;
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function getProfilePhoto(session: string, contactid: string) {
  try {
    const response = await fetch(
      `${API_URL}/api/contacts/profile-picture?contactId=${contactid}&session=${session}`
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function insertNewMessageClientContact(
  clienteMessage: InsertChatMessage
) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('chat');
    const channel = await getChannelByCompanyIdAndConnection(
      clienteMessage.connection
    );
    if (!channel) {
      clienteMessage.inBot = false;
      clienteMessage.active = true;
      const response = await dbMongo.insertOne({
        ...clienteMessage
      });
      if (response.insertedId) {
        return response.insertedId;
      }
      throw new Error('Error inserting message');
    }

    const bot = await getAllBotsByChannelId(channel.id);
    if (bot.length === 0) {
      clienteMessage.inBot = false;
      clienteMessage.active = true;
      const response = await dbMongo.insertOne({
        ...clienteMessage
      });
      if (response.insertedId) {
        return response.insertedId;
      }
      throw new Error('Error inserting message');
    }
    let botSend: Bot;
    const botNewUser = bot.filter((bot) => bot.type === 0);
    if (botNewUser.length > 0) {
      botSend = botNewUser[0];
    } else {
      botSend = bot[0];
    }

    const contactExist = await findClientInDBByConectionAndSession(
      clienteMessage.connection,
      clienteMessage.session,
      clienteMessage.contactId
    );
    const pgotoURL = await getProfilePhoto(
      clienteMessage.session,
      clienteMessage.contactId
    );
    if (pgotoURL) clienteMessage.photoURL = pgotoURL.profilePictureURL;

    const segmentation = botSend.questions.filter(
      (q) => q.type_question == 'segmentation'
    );
    if (segmentation.length === 0) {
      //todo para iniciar o bot sem segmentação
      return;
    }

    if (contactExist) {
      if (contactExist.botState?.currentStage === 'segmentation') {
        const stateSegmentation = segmentation.find(
          (s) =>
            s.sequence_segmentation ===
            contactExist.botState?.currentSegmentationId
        );
        if (!stateSegmentation) return;
        const chaveDinamica = stateSegmentation?.key_segmentation;
        const segmentationUser: SegmentationInfo = {
          [chaveDinamica]: clienteMessage.messages[0].body
        };
        if (chaveDinamica === 'Nome')
          clienteMessage.contactName = clienteMessage.messages[0].body;
        if (contactExist.segmentInfo) {
          contactExist.segmentInfo = {
            ...contactExist.segmentInfo,
            ...segmentationUser
          };
        } else {
          contactExist.segmentInfo = segmentationUser;
        }
        if (segmentation.length > contactExist.botState.currentSegmentationId) {
          const send: SendMessage = {
            chatId: clienteMessage.contactId,
            text: segmentation[contactExist.botState?.currentSegmentationId]
              .text,
            session: clienteMessage.session
          };

          contactExist.botState.currentSegmentationId =
            contactExist.botState?.currentSegmentationId + 1;
          contactExist.botState.lastInteraction = contactExist.lastMessage;
          setTimeout(async () => {
            await insertMenssageAndUpdateChatByContactIDAndSession(
              contactExist
            );
            await sendMessageByContactIdAndSession(clienteMessage, send);
          }, 1000);
        } else if (
          segmentation.length === contactExist.botState.currentSegmentationId
        ) {
          contactExist.botState.currentStage = 'menu';
          await insertMenssageAndUpdateChatByContactIDAndSession(contactExist);
          const botMenu = botSend.questions.find(
            (q) => q.type_question == 'menu'
          );
          if (botMenu) {
            const send: SendMessage = {
              chatId: clienteMessage.contactId,
              text: `${botMenu.text}
${botMenu.options[0].id} - ${botMenu.options[0].label}`,
              session: clienteMessage.session
            };
            await sendMessageByContactIdAndSession(clienteMessage, send);
            console.log(botMenu.options);
          }
        }
      }
    } else {
      const send: SendMessage = {
        chatId: clienteMessage.contactId,
        text: botSend.greeting_message,
        session: clienteMessage.session
      };
      await sendMessageTypeZero(clienteMessage, send);
      const firstSegmentation = segmentation.find(
        (e) => e.sequence_segmentation === 1
      );
      if (!firstSegmentation) return;
      const botState: BotState = {
        currentStage: 'segmentation',
        startedAt: clienteMessage.lastMessage,
        lastInteraction: clienteMessage.lastMessage,
        currentSegmentationId: 1,
        currentQuestionId: 0
      };
      clienteMessage.botState = botState;
      const sendSegmentation: SendMessage = {
        chatId: clienteMessage.contactId,
        text: firstSegmentation.text,
        session: clienteMessage.session
      };

      setTimeout(async () => {
        await sendMessageByContactIdAndSession(
          clienteMessage,
          sendSegmentation
        );
      }, 500);
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function sendMessageByContactIdAndSession(
  clienteMessage: InsertChatMessage,
  send: SendMessage
) {
  await updateStateClient(clienteMessage);

  await sendMessage(send);
}

async function updateStateClient(message: InsertChatMessage) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('chat');

    const updateFields: any = {
      totalAttendances: message.totalAttendances,
      totalMessages: message.totalMessages,
      lastMessage: message.lastMessage,
      photoURL: message.photoURL,
      inBot: message.inBot,
      active: message.active,
      dateCreateChat: message.dateCreateChat
    };

    if (message.botState) {
      updateFields.botState = message.botState;
    }
    if (message.segmentInfo) {
      updateFields.segmentInfo = message.segmentInfo;
    }
    await dbMongo.updateOne(
      { contactId: message.contactId, session: message.session },
      {
        $set: updateFields
      },
      { upsert: true }
    );
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function sendMessageTypeZero(
  clienteMessage: InsertChatMessage,
  send: SendMessage
) {
  await insertNewMenssage(clienteMessage);

  await sendMessage(send);
}

async function insertNewMenssage(messages: InsertChatMessage) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('chat');
    const response = await dbMongo.insertOne({
      ...messages
    });
    if (response.insertedId) {
      return response.insertedId;
    }
    throw new Error('Error inserting message');
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function insertMenssageAndUpdateChatByContactIDAndSession(
  messages: InsertChatMessage
) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('chat');

    const updateFields: any = {
      totalAttendances: messages.totalAttendances,
      totalMessages: messages.totalMessages,
      lastMessage: messages.lastMessage,
      photoURL: messages.photoURL,
      inBot: messages.inBot,
      active: messages.active,
      dateCreateChat: messages.dateCreateChat
    };

    if (messages.contactName != '') {
      updateFields.contactName = messages.contactName;
    }
    if (messages.botState) {
      updateFields.botState = messages.botState;
    }

    if (messages.segmentInfo) {
      updateFields.segmentInfo = messages.segmentInfo;
    }
    await dbMongo.updateOne(
      { contactId: messages.contactId, session: messages.session },
      {
        $set: updateFields,
        $push: {
          messages: { $each: messages.messages }
        } as unknown as PushOperator<ChatMessage[]>
      },
      { upsert: true }
    );
  } catch (error: any) {
    console.warn(error.message);
  }
}
