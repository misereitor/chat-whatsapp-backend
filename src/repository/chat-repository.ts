import pool from '../config/pg_db.conf';
import { Channel } from '../model/channel-model';
import { Customer, InsertCustomer } from '../model/chat-model';

export async function createCustomer(customer: InsertCustomer) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO customers ' +
        '(chat_id, photo_url, total_attendances, total_messages, phone_number, contact_name, channel_id, ' +
        'last_message, in_bot, active, department_id, user_id, date_create_chat, segment_info, ' +
        'current_stage, current_question_id, current_segmentation_id, started_at) ' +
        'VALUES ' +
        '($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)',
      values: [
        customer.chatId,
        customer.photoURL,
        customer.totalAttendances,
        customer.totalMessages,
        customer.phoneNumber,
        customer.contactName,
        customer.channel_id,
        customer.lastMessage,
        customer.inBot,
        customer.active,
        customer.department_id,
        customer.user_id,
        customer.dateCreateChat,
        customer.segmentInfo,
        customer.currentStage,
        customer.currentQuestionId,
        customer.currentSegmentationId,
        customer.startedAt
      ],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows as unknown as Customer;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updateCustomer(customer: Customer) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'UPDATE customers SET ' +
        'photo_url = $1, total_attendances = $2, total_messages = $3, contact_name = $4, channel_id = $5, last_message = $6, ' +
        'in_bot = $7, active = $8, department_id = $9, user_id = $10, date_create_chat = $11, segment_info = $12, ' +
        'current_stage = $13, current_question_id = $14, current_segmentation_id = $15, started_at = $16 ' +
        'WHERE id = $17',
      values: [
        customer.photoURL,
        customer.totalAttendances,
        customer.totalMessages,
        customer.contactName,
        customer.channel.id,
        customer.lastMessage,
        customer.inBot,
        customer.active,
        customer.department?.id,
        customer.user?.id,
        customer.dateCreateChat,
        customer.segmentInfo,
        customer.currentStage,
        customer.currentQuestionId,
        customer.currentSegmentationId,
        customer.startedAt,
        customer.id
      ],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows as unknown as Customer;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getCustomerByChannelAndChatId(
  channel: Channel,
  chatId: string
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
SELECT 
  c.id,
  c.chat_id AS "chatId",
  c.photo_url AS "photoURL",
  c.total_attendances AS "totalAttendances",
  c.total_messages AS "totalMessages",
  c.phone_number AS "phoneNumber",
  c.contact_name AS "contactName",
  c.last_message AS "lastMessage",
  c.in_bot AS "inBot",
  c.active,
  c.date_create_chat AS "dateCreateChat",
  c.current_stage AS "currentStage",
  c.current_question_id AS "currentQuestionId",
  c.current_segmentation_id AS "currentSegmentationId",
  c.started_at AS "startedAt",
  c.segment_info AS "segmentInfo",

  -- Informação do canal
  jsonb_build_object(
      'id', ch.id,
      'name', ch.name,
      'connection', ch.connection,
      'session', ch.session,
      'channel_type', ch.channel_type,
      'is_active', ch.is_active,
      'created_at', ch.created_at,
      'updated_at', ch.updated_at
  ) AS channel,

  -- Informação do departamento (pode ser NULL)
  COALESCE(
        CASE
            WHEN c.department_id IS NOT NULL THEN jsonb_build_object(
                'id', d.id,
                'name', d.name,
                'business_hours_id', d.business_hours_id,
                'is_active', d.is_active,
                'created_at', d.created_at,
                'updated_at', d.updated_at
            )
            ELSE '{}'::jsonb
        END,
        '{}'::jsonb
    ) AS department,

  -- Informação do usuário (pode ser NULL)
COALESCE(
        CASE
            WHEN c.user_id IS NOT NULL THEN jsonb_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email,
                'phone_number', u.phone_number,
                'photo_url', u.photo_url,
                'login', u.login,
                'is_active', u.is_active,
                'created_at', u.created_at,
                'updated_at', u.updated_at
            )
            ELSE '{}'::jsonb
        END,
        '{}'::jsonb
    ) AS "user"

FROM 
    customers c
LEFT JOIN channels ch ON c.channel_id = ch.id
LEFT JOIN departments d ON c.department_id = d.id
LEFT JOIN users u ON c.user_id = u.id

WHERE c.channel_id = $1 AND c.chat_id = $2
      `,
      values: [channel.id, chatId],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as Customer;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getAllCustommerByUserAndDepartment(
  channel: Channel,
  user_id: number,
  department_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
SELECT 
  c.id,
  c.chat_id AS "chatId",
  c.photo_url AS "photoURL",
  c.total_attendances AS "totalAttendances",
  c.total_messages AS "totalMessages",
  c.phone_number AS "phoneNumber",
  c.contact_name AS "contactName",
  c.last_message AS "lastMessage",
  c.in_bot AS "inBot",
  c.active,
  c.date_create_chat AS "dateCreateChat",
  c.current_stage AS "currentStage",
  c.current_question_id AS "currentQuestionId",
  c.current_segmentation_id AS "currentSegmentationId",
  c.started_at AS "startedAt",
  c.segment_info AS "segmentInfo",

  -- Informação do canal
  jsonb_build_object(
      'id', ch.id,
      'name', ch.name,
      'connection', ch.connection,
      'session', ch.session,
      'channel_type', ch.channel_type,
      'is_active', ch.is_active,
      'created_at', ch.created_at,
      'updated_at', ch.updated_at
  ) AS channel,

  -- Informação do departamento (pode ser NULL)
  COALESCE(
        CASE
            WHEN c.department_id IS NOT NULL THEN jsonb_build_object(
                'id', d.id,
                'name', d.name,
                'business_hours_id', d.business_hours_id,
                'is_active', d.is_active,
                'created_at', d.created_at,
                'updated_at', d.updated_at
            )
            ELSE '{}'::jsonb
        END,
        '{}'::jsonb
    ) AS department,

  -- Informação do usuário (pode ser NULL)
COALESCE(
        CASE
            WHEN c.user_id IS NOT NULL THEN jsonb_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email,
                'phone_number', u.phone_number,
                'photo_url', u.photo_url,
                'login', u.login,
                'is_active', u.is_active,
                'created_at', u.created_at,
                'updated_at', u.updated_at
            )
            ELSE '{}'::jsonb
        END,
        '{}'::jsonb
    ) AS "user"
FROM 
    customers c
LEFT JOIN channels ch ON c.channel_id = ch.id
LEFT JOIN departments d ON c.department_id = d.id
LEFT JOIN users u ON c.user_id = u.id

-- Condições para os dados filtrados
WHERE 
    c.in_bot = false
    AND c.active = true AND c.channel_id = $1 

    AND (c.user_id = $2 OR c.user_id IS NULL)

    AND (
        ($2 IS NOT NULL AND (c.department_id = $3 OR c.department_id IS NULL))
        OR ($2 IS NULL AND c.department_id = $3)
    );
      `,
      values: [channel.id, user_id, department_id]
    };
    const { rows } = await client.query(query);
    return rows as unknown as Customer[];
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
