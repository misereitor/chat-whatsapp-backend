import pool from '../config/pg_db.conf';
import {
  CreateFastMessage,
  FastMessage,
  GetAllFastMessages
} from '../model/fast-message-model';

export async function getAllFastMessagesRepository(user: GetAllFastMessages) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        SELECT 
          fm.*,
          COALESCE(
              json_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL),
              '[]'::json
          ) AS departments,
          COALESCE(
              json_agg(DISTINCT u.*) FILTER (WHERE u.id IS NOT NULL),
              '[]'::json
          ) AS users
        FROM fast_messages fm
        LEFT JOIN departments_fast_messages dfm ON fm.id = dfm.fast_message_id
        LEFT JOIN departments d ON dfm.department_id = d.id
        LEFT JOIN users u ON fm.user_create_id = u.id
        WHERE fm.company_id = $1
          AND (fm.user_create_id = $2 OR dfm.department_id = ANY($3::int[]))
        GROUP BY fm.id;
      `,
      values: [user.company_id, user.user_id, user.departments_id]
    };
    const { rows } = await client.query(query);
    return rows as unknown as FastMessage[];
  } catch (error: any) {
    throw new Error(`Error fetching fast messages: ${error.message}`);
  } finally {
    client.release();
  }
}

export async function getFastMessageByIdRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
      SELECT 
          fm.*,
          COALESCE(
              json_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL),
              '[]'::json
          ) AS departments,
          COALESCE(
              json_agg(DISTINCT u.*) FILTER (WHERE u.id IS NOT NULL),
              '[]'::json
          ) AS users
      FROM fast_messages fm
      LEFT JOIN departments_fast_messages dfm ON fm.id = dfm.fast_message_id
      LEFT JOIN departments d ON dfm.department_id = d.id
      LEFT JOIN users u ON fm.user_create_id = u.id
      WHERE fm.id = $1
      GROUP BY fm.id;
    `,
      values: [id]
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as FastMessage;
  } catch (error: any) {
    throw new Error(`Error fetching fast messages: ${error.message}`);
  } finally {
    client.release();
  }
}

export async function createFastMessageRepository(
  fastMessage: CreateFastMessage
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        INSERT INTO fast_messages (message, keyword, user_create_id, company_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      values: [
        fastMessage.message,
        fastMessage.keyword,
        fastMessage.user_create_id,
        fastMessage.company_id
      ]
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as FastMessage;
  } catch (error: any) {
    throw new Error(`Error creating fast message: ${error.message}`);
  } finally {
    client.release();
  }
}

export async function updateFastMessageReporitory(fastMessage: FastMessage) {
  try {
    const query = {
      text: `
        UPDATE fast_messages
        SET message = $1, keyword = $2
        WHERE id = $3
        RETURNING *
      `,
      values: [fastMessage.message, fastMessage.keyword, fastMessage.id]
    };
    const { rows } = await pool.query(query);
    return rows[0] as unknown as FastMessage;
  } catch (error: any) {
    throw new Error(`Error updating fast message: ${error.message}`);
  }
}

export async function addFastMessageToDepartmentRepository(
  fast_message_id: number,
  department_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        INSERT INTO departments_fast_messages (fast_message_id, department_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `,
      values: [fast_message_id, department_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(
      `Error associating fast message to department: ${error.message}`
    );
  } finally {
    client.release();
  }
}

export async function removeFastMessageToDepartmentRepository(
  fast_message_id: number,
  department_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        DELETE FROM departments_fast_messages WHERE fast_message_id = $1 ADN department_id = $2
      `,
      values: [fast_message_id, department_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(
      `Error associating fast message to department: ${error.message}`
    );
  } finally {
    client.release();
  }
}

export async function removeAllFastMessageToDepartmentRepository(
  fast_message_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        DELETE FROM departments_fast_messages WHERE fast_message_id = $1`,
      values: [fast_message_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(
      `Error associating fast message to department: ${error.message}`
    );
  } finally {
    client.release();
  }
}

export async function deleteFastMessageRepository(fast_message_id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: `DELETE FROM fast_messages WHERE id = $1`,
      values: [fast_message_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(`Error deleting fast message: ${error.message}`);
  } finally {
    client.release();
  }
}
