export interface Department {
  id: number;
  name: string;
  company_id: number;
  is_active: boolean;
  business_hours_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Createdepartment {
  company_id: number;
  business_hours_id?: number;
  name: string;
  is_active: boolean;
}

export interface Updatedepartment {
  department_id: number;
  company_id: number;
  name: string;
  is_active: boolean;
  user_id: number;
}

export interface AssociateDepartment {
  user_id: number;
  department_id: number;
}
