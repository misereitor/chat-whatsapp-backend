export interface Bot {
  id: number;
  type: number;
  name: string;
  greeting_message: string;
  has_menu: boolean;
  has_segmentation: boolean;
  has_evaluation: boolean;
  option_message: string;
  targeting_message: string;
  absent_message: string;
  message_evaluation: string;
  evaluation_thanks_message: string;
  error_evaluation_message: string;
  final_greeting_message: string;
  description: string;
  time_limit_avaliation: number;
  time_limit_notes: number;
  time_limit_potential: number;
  enable_avaliation: boolean;
  enable_viewer: boolean;
  send_user_name_in_chat: boolean;
  enable_finish_quest: boolean;
  enable_contact_finish_chat: boolean;
  enable_groups: boolean;
  created_at: Date;
  questions: BotQuestions[];
}

export interface BotQuestions {
  id: number;
  bot_id: number;
  type_question: string;
  type_response: string;
  url: string;
  text: string;
  key_segmentation: string;
  sequence_segmentation: number;
  options: BotOptions[];
}

export interface BotOptions {
  id: number;
  label: string;
  option: BotOptions;
}

export interface BotOptions {
  id: number;
  text: string;
  type: 'attendant' | 'department' | 'submenu' | 'text';
  action: BotAction;
}

export interface BotAction {
  option_id?: number;
  departament_id?: number;
  attendant_id?: number;
  text?: string;
}
