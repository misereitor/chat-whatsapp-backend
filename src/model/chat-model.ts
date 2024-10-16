import { ObjectId } from 'mongodb';

export interface CustomersMessage {
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
  departmentId?: number;
  userId?: number;
  active: boolean;
  dateCreateChat: number;
  botState?: BotState;
  segmentInfo?: any;
}

export interface Customer {
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
  inBot: boolean;
  departmentId?: number;
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

export interface InsertCustomer {
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
  inBot: boolean;
  departmentId?: number;
  userId?: number;
  active: boolean;
  dateCreateChat: number;
  botState?: BotState;
  segmentInfo?: SegmentationInfo;
}

export interface InsertMessage {
  contactId: string;
  session: string;
  connection: string;
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
  participant?: string;
  body?: string;
}

export interface Media {
  url?: string;
  filename?: string;
  mimetype?: string;
  s3?: S3 | null;
  error?: Error | null;
}

export interface S3 {
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
  departmentId: number;
}
