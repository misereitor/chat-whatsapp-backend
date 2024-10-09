import pool from '../config/pg_db.conf';
import { Company } from '../model/company-model';

export async function createCompany(company: Company) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO companies (company_name, trade_name, type, cnpj, is_active)' +
        'VALUES' +
        '($1, $2, $3, $4, $5) RETURNING *',
      values: [
        company.company_name,
        company.trade_name,
        company.type,
        company.cnpj,
        company.is_active
      ],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows as unknown as Company;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getCompanyById(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
      SELECT 
        c.id AS company_id,
        c.company_name,
        c.trade_name,
        c.type,
        c.cnpj,
        c.is_active,
        c.created_at,
        c.updated_at,

        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
              'id', ch.id,
              'name', ch.name,
              'connection', ch.connection,
              'channel_type_id', ch.channel_type_id,
              'is_active', ch.is_active,
              'created_at', ch.created_at,
              'updated_at', ch.updated_at
          )) FILTER (WHERE ch.id IS NOT NULL), '[]'::jsonb
        ) AS channels,

        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
              'id', u.id,
              'name', u.name,
              'email', u.email,
              'phone_number', u.phone_number,
              'photo_url', u.photo_url,
              'login', u.login,
              'is_active', u.is_active,
              'created_at', u.created_at,
              'updated_at', u.updated_at,
              'role', jsonb_build_object(
                  'id', r.id,
                  'name', r.name
              )
          )) FILTER (WHERE u.id IS NOT NULL), '[]'::jsonb
        ) AS users,

        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
              'id', m.id,
              'name', m.name,
              'description', m.description,
              'start_date', cm.start_date,
              'end_date', cm.end_date
          )) FILTER (WHERE m.id IS NOT NULL), '[]'::jsonb
        ) AS modules,

        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'max_admins', p.max_admins,
          'max_supervisors', p.max_supervisors,
          'max_users', p.max_users,
          'start_date', cp.start_date,
          'end_date', cp.end_date
        ) AS plan

    FROM 
        companies c
    LEFT JOIN channels ch ON ch.company_id = c.id

    LEFT JOIN users_roles_companies urc ON urc.company_id = c.id
    LEFT JOIN users u ON u.id = urc.user_id
    LEFT JOIN roles r ON r.id = urc.role_id

    LEFT JOIN companies_modules cm ON cm.company_id = c.id
    LEFT JOIN modules m ON m.id = cm.module_id

    LEFT JOIN companies_plans cp ON cp.company_id = c.id
    LEFT JOIN plans p ON p.id = cp.plan_id
    WHERE c.id = $1
    GROUP BY 
        c.id, p.id, cp.start_date, cp.end_date
`,
      values: [id],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as Company;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getAllCompanies() {
  const client = await pool.connect();
  try {
    const query = {
      text: `
            SELECT 
        c.id AS company_id,
        c.company_name,
        c.trade_name,
        c.type,
        c.cnpj,
        c.is_active,
        c.created_at,
        c.updated_at,

        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
              'id', ch.id,
              'name', ch.name,
              'connection', ch.connection,
              'channel_type_id', ch.channel_type_id,
              'is_active', ch.is_active,
              'created_at', ch.created_at,
              'updated_at', ch.updated_at
          )) FILTER (WHERE ch.id IS NOT NULL), '[]'::jsonb
        ) AS channels,

        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
              'id', u.id,
              'name', u.name,
              'email', u.email,
              'phone_number', u.phone_number,
              'photo_url', u.photo_url,
              'login', u.login,
              'is_active', u.is_active,
              'created_at', u.created_at,
              'updated_at', u.updated_at,
              'role', jsonb_build_object(
                  'id', r.id,
                  'name', r.name
              )
          )) FILTER (WHERE u.id IS NOT NULL), '[]'::jsonb
        ) AS users,

        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
              'id', m.id,
              'name', m.name,
              'description', m.description,
              'start_date', cm.start_date,
              'end_date', cm.end_date
          )) FILTER (WHERE m.id IS NOT NULL), '[]'::jsonb
        ) AS modules,

        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'max_admins', p.max_admins,
          'max_supervisors', p.max_supervisors,
          'max_users', p.max_users,
          'start_date', cp.start_date,
          'end_date', cp.end_date
        ) AS plan

    FROM 
        companies c
    LEFT JOIN channels ch ON ch.company_id = c.id

    LEFT JOIN users_roles_companies urc ON urc.company_id = c.id
    LEFT JOIN users u ON u.id = urc.user_id
    LEFT JOIN roles r ON r.id = urc.role_id

    LEFT JOIN companies_modules cm ON cm.company_id = c.id
    LEFT JOIN modules m ON m.id = cm.module_id

    LEFT JOIN companies_plans cp ON cp.company_id = c.id
    LEFT JOIN plans p ON p.id = cp.plan_id
    GROUP BY 
        c.id, p.id, cp.start_date, cp.end_date`
    };
    const { rows } = await client.query(query);
    return rows as unknown as Company[];
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getCompanyByCPNJ(cnpj: string) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
            SELECT 
        c.id AS company_id,
        c.company_name,
        c.trade_name,
        c.type,
        c.cnpj,
        c.is_active,
        c.created_at,
        c.updated_at,

        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
              'id', ch.id,
              'name', ch.name,
              'connection', ch.connection,
              'channel_type_id', ch.channel_type_id,
              'is_active', ch.is_active,
              'created_at', ch.created_at,
              'updated_at', ch.updated_at
          )) FILTER (WHERE ch.id IS NOT NULL), '[]'::jsonb
        ) AS channels,

        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
              'id', u.id,
              'name', u.name,
              'email', u.email,
              'phone_number', u.phone_number,
              'photo_url', u.photo_url,
              'login', u.login,
              'is_active', u.is_active,
              'created_at', u.created_at,
              'updated_at', u.updated_at,
              'role', jsonb_build_object(
                  'id', r.id,
                  'name', r.name
              )
          )) FILTER (WHERE u.id IS NOT NULL), '[]'::jsonb
        ) AS users,

        COALESCE(
          jsonb_agg(DISTINCT jsonb_build_object(
              'id', m.id,
              'name', m.name,
              'description', m.description,
              'start_date', cm.start_date,
              'end_date', cm.end_date
          )) FILTER (WHERE m.id IS NOT NULL), '[]'::jsonb
        ) AS modules,

        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'max_admins', p.max_admins,
          'max_supervisors', p.max_supervisors,
          'max_users', p.max_users,
          'start_date', cp.start_date,
          'end_date', cp.end_date
        ) AS plan

    FROM 
        companies c
    LEFT JOIN channels ch ON ch.company_id = c.id

    LEFT JOIN users_roles_companies urc ON urc.company_id = c.id
    LEFT JOIN users u ON u.id = urc.user_id
    LEFT JOIN roles r ON r.id = urc.role_id

    LEFT JOIN companies_modules cm ON cm.company_id = c.id
    LEFT JOIN modules m ON m.id = cm.module_id

    LEFT JOIN companies_plans cp ON cp.company_id = c.id
    LEFT JOIN plans p ON p.id = cp.plan_id
    WHERE c.cnpj = $1
    GROUP BY 
        c.id, p.id, cp.start_date, cp.end_date`,
      values: [cnpj],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows as unknown as Company;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updateCompany(company: Company) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE companies SET company_name = $1, trade_name = $2, type = $3, cnpj = $4, update_at = CURRENT_TIMESTAMP WHERE id = $5',
      values: [
        company.company_name,
        company.trade_name,
        company.type,
        company.cnpj,
        company.id
      ]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function desactiveCompany(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE companies SET is_active = false, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function activeCompany(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE companies SET is_active = true, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
