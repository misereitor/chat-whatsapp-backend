import pool from '../config/pg_db.conf';
import { Role } from '../model/user-model';

export async function createAssociationRole(
  user_id: number,
  company_id: number,
  role_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO users_roles_companies (user_id, company_id, role_id)' +
        'VALUES' +
        '($1, $2, $3)',
      values: [user_id, company_id, role_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function gerRoleForId(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM roles WHERE id = $1',
      values: [id]
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as Role;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updateAssociationRole(
  user_id: number,
  company_id: number,
  role_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE users_roles_companies SET role_id = $3 WHERE user_id = $1 and company_id = $2',
      values: [user_id, company_id, role_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
