import { ObjectId } from 'mongodb';
import { Channel } from './channel-model';
import { Department } from './department-model';
import { User } from './user-model';

export interface CustomersMessage {
  id: number;
  chatId: string;
  photoURL?: string;
  totalAttendances: number;
  totalMessages: number;
  phoneNumber: string;
  contactName: string;
  channel: Channel;
  lastMessage: number;
  inBot: boolean;
  active: boolean;
  department?: Department;
  user?: User;
  dateCreateChat: number;
  segmentInfo?: any;
  currentStage: 'segmentation' | 'menu' | 'service' | 'finished';
  currentQuestionId: number;
  currentSegmentationId: number;
  startedAt: number;
  messages: Message[];
}

export interface Customer {
  messages?: Message[];
  id: number;
  chatId: string;
  photoURL?: string;
  totalAttendances: number;
  totalMessages: number;
  phoneNumber: string;
  contactName: string;
  channel: Channel;
  lastMessage: number;
  inBot: boolean;
  active: boolean;
  department?: Department;
  user?: User;
  dateCreateChat: number;
  segmentInfo?: any;
  currentStage: 'segmentation' | 'menu' | 'service' | 'finished';
  currentQuestionId: number;
  currentSegmentationId: number;
  startedAt: number;
}

export interface InsertCustomer {
  id: number;
  chatId: string;
  photoURL?: string;
  totalAttendances: number;
  totalMessages: number;
  phoneNumber: string;
  contactName: string;
  channel_id: number;
  lastMessage: number;
  inBot: boolean;
  active: boolean;
  department_id?: number;
  user_id?: number;
  dateCreateChat: number;
  segmentInfo?: any;
  currentStage: 'segmentation' | 'menu' | 'service' | 'finished';
  currentQuestionId: number;
  currentSegmentationId: number;
  startedAt: number;
}

export interface InsertMessage {
  chatId: string;
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
  chatId: string;
  session: string;
  connection: string;
}

export interface ReplyTo {
  participant?: string;
  body?: string;
}

export interface Media {
  url?: string;
  filename?: string;
  portrait?: boolean;
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
  attendantId?: number;
  departmentId?: number;
}
