import { Department } from './department-model';

export interface Tag {
  id?: number;
  name: string;
  user_id: number;
  company_id: number;
  all_department: boolean;
  departments: Department[];
  bg_color: string;
  text_color: string;
  users: {
    id: number;
    name: string;
    role: string;
  };
  created_at?: Date;
}

export interface createTag {
  name: string;
  user_id: number;
  company_id: number;
  bg_color: string;
  text_color: string;
  all_department: boolean;
  departments: number[];
}

export interface AssociateTag {
  tag_id: number;
  department_id: number[];
}
