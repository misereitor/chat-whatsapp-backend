import { Company } from './company-model';
import { Department } from './department-model';
import { User } from './user-model';

export interface FastMessage {
  id: number;
  keyword: string;
  message: string;
  userCreate: User;
  company: Company;
  created_at: Date;
  departments: Department[];
}

export interface CreateFastMessage {
  keyword: string;
  message: string;
  user_create_id: number;
  company_id: number;
  created_at: Date;
  departments_id: number[];
}

export interface GetAllFastMessages {
  user_id: number;
  company_id: number;
  departments_id: number[];
}
