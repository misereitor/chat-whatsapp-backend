export interface Modules {
  id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
}

export interface AssociateModule {
  company_id: number;
  module_id: number;
  start_date?: Date;
  end_date?: Date;
}
