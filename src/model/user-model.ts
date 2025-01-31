import { Company } from './company-model';
import { Department } from './department-model';

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  photo_url: string;
  login: string;
  password: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
  grade: number[];
  company: Company;
  departments: Department[];
}

export interface InsertUser {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  photo?: string;
  photoBlob?: Blob;
  photo_url?: string;
  login: string;
  password: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
  company_id: number;
  departments?: Department[];
}

export interface Role {
  id: number;
  name: string;
}
