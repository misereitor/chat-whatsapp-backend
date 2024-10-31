export interface Plan {
  id: number;
  name: string;
  max_admins: number;
  max_supervisors: number;
  max_users: number;
  created_ad: Date;
}

export interface AssociatePlan {
  company_id: number;
  plan_id: number;
  start_date?: Date;
  end_date?: Date;
}
