import { ObjectId } from 'mongodb';
import { WebhookMessage } from '../model/webhook-model';
import {
  CustomersMessage,
  InsertCustomer,
  Media,
  InsertMessage,
  ReplyTo,
  S3
} from '../model/chat-model';

export const replaceMessage = (message: WebhookMessage) => {
  let timestamp = 0;
  if (typeof message.payload.timestamp === 'number') {
    timestamp = message.payload.timestamp;
  } else {
    timestamp = message.payload.timestamp.low;
  }

  const ReplyTo: ReplyTo = {
    participant: message.payload.participant,
    body: message.payload.body
  };
  const s3: S3 = {
    bucket: message.payload.media?.s3?.bucket,
    key: message.payload.media?.s3?.key
  };
  const media: Media = {
    url: message.payload.media?.url,
    filename: message.payload.media?.filename,
    mimetype: message.payload.media?.mimetype,
    s3: message.payload.media?.s3 ? s3 : null,
    error: message.payload.media?.error
  };
  const messagem: InsertMessage = {
    id: message.payload.id,
    timestamp: timestamp,
    fromMe: message.payload.fromMe,
    participant: message.payload.participant
      ? message.payload.participant
      : null,
    body: message.payload.body,
    hasMedia: message.payload.hasMedia,
    media: message.payload.media ? media : null,
    status: message.payload.ack,
    replyTo: message.payload.replyTo ? ReplyTo : null,
    vCard: message.payload.vCard ? message.payload.vCard : null,
    contactId: message.payload.from,
    session: message.session,
    connection: message.me.id
  };
  const contact: InsertCustomer = {
    contactName: '',
    connection: message.me.id,
    session: message.session,
    phoneNumber: message.payload.from.split('@')[0],
    contactId: message.payload.from,
    totalAttendances: 1,
    totalMessages: 1,
    lastMessage: timestamp,
    photoURL: '',
    connectionType: 'whatsapp',
    inBot: true,
    active: false,
    dateCreateChat: new Date().getTime()
  };
  return { contact, messagem };
};

export const replaceMessageUpdateStatus = (message: WebhookMessage) => {
  const messages = {
    id: message.payload.id,
    status: message.payload.ack
  };
  const messageReplace = {
    _id: new ObjectId(),
    connection: message.me.id,
    session: message.session,
    messages: [messages],
    contactId: message.payload.from
  };
  return messageReplace as CustomersMessage;
};
