import { ObjectId } from 'mongodb';

export interface ContactRequest {
  name: string;
  email: string[];
  phoneNumber: string[];
  address: string[];
  company: string;
  notes: string;
  companyId: number;
  userId: number;
  bot: boolean;
  departamentId: number[];
}

export interface Contact {
  _id: ObjectId;
  name: string;
  email: string[];
  phoneNumber: string[];
  address: string[];
  company: string;
  notes: string;
  companyId: number;
  userId: number;
  bot: boolean;
  departamentId: number[];
}

export interface ContactResponse {
  user: Contact[];
  shared: Contact[];
  bot: Contact[];
}

export interface ContactFilter {
  companyId: number;
  userId?: number;
  departamentId?: number[];
  bot?: boolean;
  page: number;
  limit: number;
  search: string;
}
