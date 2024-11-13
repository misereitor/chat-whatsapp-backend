import { io } from '../app';
import { connectToMongo } from '../config/mongo_db.conf';
import {
  Customer,
  InsertMessage,
  Message,
  SendMessage
} from '../model/chat-model';
import { WebhookMessage } from '../model/webhook-model';
import { getChannelByConnectionAndSession } from '../repository/channel-repository';
import { getCustomerByChannelAndChatId } from '../repository/chat-repository';
import {
  getImageDimensions,
  getVideoDimensionsFromBlob
} from '../util/media-dimensions';
import { replaceMessageUpdateStatus } from '../util/replaceMessage';
import { extractThumbnail } from '../util/videoThumbnail';
import { uploadFileService } from './aws/s3-service';

const {
  API_URL_WHATSAPP_NO_OFFICIAL,
  MONGO_DB,
  SECRET_AIP_WHATSAPP_NO_OFFICIAL
} = process.env;

export async function insertNewMessageByCustomer(message: InsertMessage) {
  try {
    if (message.hasMedia && message.media?.url) {
      if (message.media?.mimetype?.split('/')[0] === 'video') {
        const nameFile = message.media.url
          .split('/')
          .slice(-1)[0]
          .split('?')[0]
          .split('.')[0];
        const blobMessage = await getBlobMedia(message.media.url);
        if (!blobMessage) return;
        message.media.portrait = await getVideoDimensionsFromBlob(blobMessage);
        const thumbnail = await extractThumbnail(blobMessage);
        const blobThumbnail = new Blob([thumbnail], {
          type: message.media.mimetype
        });
        await uploadFileService(`thumbnail/${nameFile}.png`, blobThumbnail);
      }
      if (message.media?.mimetype === 'image/jpeg') {
        const blobMessage = await getBlobMedia(message.media.url);
        if (!blobMessage) return;
        message.media.portrait = await getImageDimensions(blobMessage);
      }
    }
    const mongoClient = await connectToMongo();
    const dbMessages = mongoClient.db(MONGO_DB).collection('messages');
    const insertMessage = await dbMessages.insertOne({
      ...message
    });
    return insertMessage;
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

export async function optionError(
  chatId: string,
  session: string,
  message: string
) {
  const send: SendMessage = {
    chatId,
    text: message,
    session
  };
  await sendMessage(send);
}

export async function getMessageByCustomer(customer: Customer) {
  try {
    const mongoClient = await connectToMongo();
    const dbMessages = mongoClient.db(MONGO_DB).collection('messages');
    const message = await dbMessages
      .find({
        chatId: customer.chatId,
        session: customer.channel.session,
        connection: customer.channel.connection
      })
      .toArray();
    return message as unknown as Message[];
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function updateStatusMessageAdnEmit(message: WebhookMessage) {
  try {
    const messageFiltred = replaceMessageUpdateStatus(message);
    messageFiltred.chatId = messageFiltred.chatId.replace(/:\d+/, '');
    messageFiltred.id = messageFiltred.id.replace(/:\d+/, '');
    const channel = await getChannelByConnectionAndSession(
      messageFiltred.connection,
      messageFiltred.session
    );

    const customerExist = await getCustomerByChannelAndChatId(
      channel,
      messageFiltred.chatId.replace(/:\d+/, '')
    );

    if (customerExist) {
      await updateStatusMessageByConectionAndSession(messageFiltred);
      if (!customerExist.active) return;
      io.emit(
        `${message.me.id}.${message.session}.statusMessage`,
        JSON.stringify({ ...messageFiltred })
      );
    } else {
      console.warn('Message not found after retries.');
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function updateStatusMessageByConectionAndSession(message: Message) {
  try {
    const mongoClient = await connectToMongo();
    const dbMessages = mongoClient.db(MONGO_DB).collection('messages');
    await dbMessages.updateOne(
      {
        id: message.id,
        connection: message.connection,
        session: message.session
      },
      { $set: { status: message.status } }
    );
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function getBlobMedia(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'X-Api-Key': String(SECRET_AIP_WHATSAPP_NO_OFFICIAL)
      }
    });
    if (response.ok) {
      const blob = await response.blob();
      return blob;
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}
