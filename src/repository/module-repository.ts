import pool from '../config/pg_db.conf';
import { AssociateModule, Modules } from '../model/module-model';

export async function createModuleRepository(modules: Modules) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO modules (name, description) ' +
        'VALUES ' +
        '($1, $2, $3, $4) RETURNING *',
      values: [modules.name, modules.description]
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as Modules;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getAllModulesRepository() {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM modules'
    };
    const { rows } = await client.query(query);
    return rows as unknown as Modules[];
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getModulesByNameRepository(moduleName: string) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM modules WHERE name like ($1)',
      values: [moduleName]
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as Modules;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getModuleByAssociationRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM companies_modules WHERE module_id = $1',
      values: [id]
    };
    const { rows } = await client.query(query);
    return rows as unknown as AssociateModule[];
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getModuleByIdRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM modules WHERE id = $1',
      values: [id]
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as Modules;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updateModuleRepository(module: Modules) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'UPDATE modules SET ' +
        'name = $1, description = $2 ' +
        'WHERE id = $3',
      values: [module.name, module.description, module.id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function associateModuleRepository(module: AssociateModule) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO companies_modules (company_id, module_id, end_date) ' +
        'VALUES ' +
        '($1, $2, $3) RETURNING *',
      values: [module.company_id, module.module_id, module.end_date]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function removeAllAssociationModuleByCompany(company_id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM companies_modules WHERE company_id = $1 ',
      values: [company_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function desassociateModuleRepository(module: AssociateModule) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM companies_modules WHERE company_id = $1 AND module_id = $2 ',
      values: [module.company_id, module.module_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function deleteModuleRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM modules WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
