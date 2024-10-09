import { Company } from './company-model';

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
  roles: Role;
  company: Company;
}

export interface Role {
  id: number;
  name: string;
}
