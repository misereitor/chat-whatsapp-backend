import { Bot } from './bot-model';

export interface Channel {
  id: number;
  name: string;
  channel_type: string;
  company_id: number;
  connection: string;
  session: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bots: Bot[];
}
