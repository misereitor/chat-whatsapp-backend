import pool from '../config/pg_db.conf';
import {
  Createdepartment,
  department,
  Updatedepartment
} from '../model/department-model';

export async function createdepartmentRepository(department: Createdepartment) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO departments (company_id, business_hours_id, name, is_active)' +
        'VALUES' +
        '($1, $2, $3, $4) RETURNING *',
      values: [
        department.company_id,
        department.business_hours_id,
        department.name,
        department.is_active
      ],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows as unknown as department;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getDepartmentById(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM departments WHERE id = $1',
      values: [id],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as department;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getDepartmentByCompanyId(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM departments WHERE company_id = $1',
      values: [id],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows as unknown as department[];
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function associatedepartmentForUserRepository(
  user_id: number,
  department_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO departments_users (user_id, department_id)' +
        'VALUES' +
        '($1, $2)',
      values: [user_id, department_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function disassociatedepartmentForUserRepository(
  user_id: number,
  department_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM departments_users WHERE user_id = $1 AND department_id = $2',
      values: [user_id, department_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function disassociateAllDepartmentForUserRepository(
  user_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM departments_users WHERE user_id = $1',
      values: [user_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updatedepartmentRepository(department: Updatedepartment) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'UPDATE departments SET' +
        'name = $1, update_at = CURRENT_TIMESTAMP WHERE id = $5',
      values: [department.name, department.department_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function desactivedepartmentRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE departments SET is_active = false, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function activedepartmentRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE departments SET is_active = true, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function deletedepartmentRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM departments WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
