import { WebhookMessage } from '../model/webhook-model';
import {
  InsertCustomer,
  Media,
  InsertMessage,
  ReplyTo,
  S3,
  Message
} from '../model/chat-model';

export const replaceMessage = (message: WebhookMessage, channel_id: number) => {
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
    chatId: message.payload.from,
    session: message.session,
    connection: message.me.id
  };
  const contact: InsertCustomer = {
    contactName: '',
    channel_id: channel_id,
    phoneNumber: message.payload.from.split('@')[0],
    chatId: message.payload.from,
    totalAttendances: 1,
    totalMessages: 1,
    lastMessage: timestamp,
    photoURL: '',
    inBot: true,
    active: false,
    dateCreateChat: new Date().getTime(),
    currentStage: 'segmentation',
    currentQuestionId: 0,
    currentSegmentationId: 0,
    startedAt: 0,
    id: 0
  };
  return { contact, messagem };
};

export const replaceMessageUpdateStatus = (message: WebhookMessage) => {
  const messageReplace: Message = {
    _id: '',
    id: message.payload.id,
    timestamp: 0,
    fromMe: false,
    participant: null,
    body: '',
    hasMedia: false,
    media: null,
    status: message.payload.ack,
    replyTo: null,
    vCard: null,
    chatId: message.payload.from,
    session: message.session,
    connection: message.me.id
  };
  return messageReplace as Message;
};
