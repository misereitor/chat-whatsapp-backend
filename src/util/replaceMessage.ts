import { ObjectId } from 'mongodb';
import { WebhookMessage } from '../model/webhook-model';
import {
  ChatMessage,
  InsertChatMessage,
  Media,
  Message,
  ReplyTo,
  S3
} from '../model/chat-model';

export const replaceMessage = (message: WebhookMessage): InsertChatMessage => {
  let timestamp = 0;
  if (typeof message.payload.timestamp === 'number') {
    timestamp = message.payload.timestamp;
  } else {
    timestamp = message.payload.timestamp.low;
  }

  const ReplyTo: ReplyTo = {
    _id: message.payload.id ? new ObjectId() : undefined,
    participant: message.payload.participant,
    body: message.payload.body
  };
  const s3: S3 = {
    _id: message.payload.media?.s3?.key ? new ObjectId() : undefined,
    bucket: message.payload.media?.s3?.bucket,
    key: message.payload.media?.s3?.key
  };
  const media: Media = {
    _id: message.payload.media?.url ? new ObjectId() : undefined,
    url: message.payload.media?.url,
    filename: message.payload.media?.filename,
    mimetype: message.payload.media?.mimetype,
    s3: message.payload.media?.s3 ? s3 : null,
    error: message.payload.media?.error
  };
  const messages: Message = {
    _id: new ObjectId(),
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
    vCard: message.payload.vCard ? message.payload.vCard : null
  };
  const messageReplace: InsertChatMessage = {
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
    dateCreateChat: new Date().getTime(),
    messages: [messages]
  };
  return messageReplace;
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
  return messageReplace as ChatMessage;
};
