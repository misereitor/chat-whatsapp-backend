import { ObjectId } from 'mongodb';

export interface ChatMessage {
  _id: ObjectId | string;
  contactId: string;
  photoURL?: string;
  totalAttendances: number;
  totalMessages: number;
  phoneNumber: string;
  contactName: string;
  session: string;
  connection: string;
  connectionType: string;
  lastMessage: number;
  messages: Message[];
  inBot: boolean;
  departamentId?: number;
  userId?: number;
  active: boolean;
  dateCreateChat: number;
  botState?: BotState;
  segmentInfo?: any;
}

export interface BotState {
  currentStage: string;
  currentQuestionId: number;
  currentSegmentationId: number;
  startedAt: number;
  lastInteraction: number;
}

export interface InsertChatMessage {
  contactId: string;
  photoURL?: string;
  totalAttendances: number;
  totalMessages: number;
  phoneNumber: string;
  contactName: string;
  session: string;
  connection: string;
  connectionType: string;
  lastMessage: number;
  messages: Message[];
  inBot: boolean;
  departamentId?: number;
  userId?: number;
  active: boolean;
  dateCreateChat: number;
  botState?: BotState;
  segmentInfo?: SegmentationInfo;
}

export interface SegmentationInfo {
  [chave: string]: any;
}

export interface Message {
  _id: ObjectId | string;
  id: string;
  timestamp: number;
  fromMe: boolean;
  participant: string | null;
  body: string;
  hasMedia: boolean;
  media: Media | null;
  status: number;
  replyTo: ReplyTo | null;
  vCard: string[] | null;
}

export interface ReplyTo {
  _id?: ObjectId | string;
  participant?: string;
  body?: string;
}

export interface Media {
  _id?: ObjectId | string;
  url?: string;
  filename?: string;
  mimetype?: string;
  s3?: S3 | null;
  error?: Error | null;
}

export interface S3 {
  _id?: ObjectId | string;
  bucket?: string;
  key?: string;
}

export interface SendMessage {
  chatId: string;
  text: string;
  session: string;
}

export interface CreateChat {
  phoneNumber: string;
  connection: string;
  contactName: string;
  session: string;
  userId: number;
  departamentId: number;
}
