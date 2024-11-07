import { Channel } from './channel-model';
import { modules } from './module-model';

export interface Company {
  id: number;
  company_name: string;
  trade_name: string;
  type: 'master' | 'reseller' | 'client';
  cnpj: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  channels: Channel[];
  users: UserCompany[];
  modules: modules[];
  plan: plan;
  dealer_id: number;
}

export interface CreateCompany {
  company_name: string;
  trade_name: string;
  type: 'master' | 'reseller' | 'client';
  cnpj: string;
  email: string;
  dealer_id: number;
  login: string;
  password: string;
}

export interface UserCompany {
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
}

export interface Role {
  id: number;
  name: string;
}

export interface plan {
  id: number;
  name: string;
  max_admins: number;
  max_supervisors: number;
  max_users: number;
  start_date: Date;
  end_date: Date;
}
