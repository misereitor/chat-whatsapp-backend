import { Company } from './company-model';
import { Departament } from './departament-model';

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
  company: Company;
  departaments: Departament[];
}

export interface Role {
  id: number;
  name: string;
}
