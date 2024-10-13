import pool from '../config/pg_db.conf';
import { Bot } from '../model/bot-model';

export async function getAllBotsByChannelId(
  channel_id: number
): Promise<Bot[]> {
  const client = await pool.connect();
  try {
    // Nova query para obter bots e suas perguntas
    const query = {
      text: `
        SELECT b.*, 
               jsonb_agg(bq) AS questions 
        FROM bots b 
        LEFT JOIN bot_questions bq ON bq.bot_id = b.id 
        WHERE b.id IN (SELECT bot_id FROM channel_bots WHERE channel_id = $1) 
        GROUP BY b.id
      `,
      values: [channel_id]
    };

    const { rows } = await client.query(query);

    // Se não houver bots, retornar um array vazio
    if (rows.length === 0) {
      return [] as Bot[];
    }

    // Mapear os resultados para a interface Bot
    return rows.map(
      (row) =>
        ({
          id: row.id,
          type: row.type,
          name: row.name,
          greeting_message: row.greeting_message,
          has_menu: row.has_menu,
          has_segmentation: row.has_segmentation,
          has_evaluation: row.has_evaluation,
          option_message: row.option_message,
          targeting_message: row.targeting_message,
          absent_message: row.absent_message,
          message_evaluation: row.message_evaluation,
          evaluation_thanks_message: row.evaluation_thanks_message,
          error_evaluation_message: row.error_evaluation_message,
          final_greeting_message: row.final_greeting_message,
          description: row.description,
          time_limit_avaliation: row.time_limit_avaliation,
          time_limit_notes: row.time_limit_notes,
          time_limit_potential: row.time_limit_potential,
          enable_avaliation: row.enable_avaliation,
          enable_viewer: row.enable_viewer,
          send_user_name_in_chat: row.send_user_name_in_chat,
          enable_finish_quest: row.enable_finish_quest,
          enable_contact_finish_chat: row.enable_contact_finish_chat,
          enable_groups: row.enable_groups,
          created_at: row.created_at,
          questions: row.questions ? row.questions : [] // Adiciona as perguntas ao bot
        }) as Bot
    );
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
