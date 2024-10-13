import pool from '../config/pg_db.conf';
import {
  CreateDepartament,
  Departament,
  UpdateDepartament
} from '../model/departament-model';

export async function createDepartamentRepository(
  departament: CreateDepartament
) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO departaments (company_id, business_hours_id, name, is_active)' +
        'VALUES' +
        '($1, $2, $3, $4) RETURNING *',
      values: [
        departament.company_id,
        departament.business_hours_id,
        departament.name,
        departament.is_active
      ],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows as unknown as Departament;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function associateDepartamentForUserRepository(
  user_id: number,
  departament_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO departaments_users (user_id, departament_id)' +
        'VALUES' +
        '($1, $2)',
      values: [user_id, departament_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function disassociateDepartamentForUserRepository(
  user_id: number,
  departament_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM departaments_users WHERE user_id = $1 AND departament_id = $2',
      values: [user_id, departament_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updateDepartamentRepository(
  departament: UpdateDepartament
) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'UPDATE departaments SET' +
        'name = $1, update_at = CURRENT_TIMESTAMP WHERE id = $5',
      values: [departament.name, departament.departament_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function desactiveDepartamentRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE departaments SET is_active = false, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function activeDepartamentRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE departaments SET is_active = true, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function deleteDepartamentRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM departaments WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
