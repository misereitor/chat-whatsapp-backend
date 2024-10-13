import pool from '../config/pg_db.conf';
import { User } from '../model/user-model';

export async function createUser(user: User) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO users (name, email, phone_number, photo_url, login, password, is_active)' +
        'VALUES' +
        '($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      values: [
        user.name,
        user.email,
        user.phone_number,
        user.photo_url,
        user.login,
        user.password,
        user.is_active
      ],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as User;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getUserById(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
SELECT 
    u.id AS id,
    u.name,
    u.email,
    u.phone_number,
    u.photo_url,
    u.login,
    u.password,
    u.is_active,
    u.created_at,
    u.updated_at,
    
    -- Informações de Role
    jsonb_build_object(
        'id', r.id,
        'name', r.name
    ) as role,
    
    -- Informações da Empresa e seus Canais
    jsonb_build_object(
        'id', c.id,
        'company_name', c.company_name,
        'trade_name', c.trade_name,
        'type', c.type,
        'cnpj', c.cnpj,
        'is_active', c.is_active,
        'created_at', c.created_at,
        'updated_at', c.updated_at,
        'channels', COALESCE(
            jsonb_agg(DISTINCT jsonb_build_object(
                'id', ch.id,
                'name', ch.name,
                'connection', ch.connection,
                'channel_type_id', ch.channel_type_id,
                'is_active', ch.is_active,
                'created_at', ch.created_at,
                'updated_at', ch.updated_at
            )) FILTER (WHERE ch.id IS NOT NULL), '[]'::jsonb
        )
    ) AS company,

    -- Departamentos do Usuário
    COALESCE(
        jsonb_agg(DISTINCT jsonb_build_object(
            'id', d.id,
            'name', d.name
        )) FILTER (WHERE d.id IS NOT NULL), '[]'::jsonb
    ) AS departaments

FROM 
    users u
-- Relacionamento entre usuários, empresas e roles
LEFT JOIN users_roles_companies urc ON urc.user_id = u.id
LEFT JOIN companies c ON c.id = urc.company_id
LEFT JOIN roles r ON r.id = urc.role_id

-- Relacionamento entre empresas e canais
LEFT JOIN channels ch ON ch.company_id = c.id

-- Relacionamento entre usuários e departamentos (adicionar a tabela correta aqui)
LEFT JOIN departaments_users du ON du.user_id = u.id
LEFT JOIN departaments d ON d.id = du.departament_id

WHERE u.id = $1
GROUP BY 
    u.id, c.id, r.id`,
      values: [id],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as User;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getUserByLogin(login: string) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
SELECT 
    u.id AS id,
    u.name,
    u.email,
    u.phone_number,
    u.photo_url,
    u.login,
    u.password,
    u.is_active,
    u.created_at,
    u.updated_at,
    
    -- Informações de Role
    jsonb_build_object(
        'id', r.id,
        'name', r.name
    ) as role,
    
    -- Informações da Empresa e seus Canais
    jsonb_build_object(
        'id', c.id,
        'company_name', c.company_name,
        'trade_name', c.trade_name,
        'type', c.type,
        'cnpj', c.cnpj,
        'is_active', c.is_active,
        'created_at', c.created_at,
        'updated_at', c.updated_at,
        'channels', COALESCE(
            jsonb_agg(DISTINCT jsonb_build_object(
                'id', ch.id,
                'name', ch.name,
                'connection', ch.connection,
                'channel_type_id', ch.channel_type_id,
                'is_active', ch.is_active,
                'created_at', ch.created_at,
                'updated_at', ch.updated_at
            )) FILTER (WHERE ch.id IS NOT NULL), '[]'::jsonb
        )
    ) AS company,

    -- Departamentos do Usuário
    COALESCE(
        jsonb_agg(DISTINCT jsonb_build_object(
            'id', d.id,
            'name', d.name
        )) FILTER (WHERE d.id IS NOT NULL), '[]'::jsonb
    ) AS departaments

FROM 
    users u
-- Relacionamento entre usuários, empresas e roles
LEFT JOIN users_roles_companies urc ON urc.user_id = u.id
LEFT JOIN companies c ON c.id = urc.company_id
LEFT JOIN roles r ON r.id = urc.role_id

-- Relacionamento entre empresas e canais
LEFT JOIN channels ch ON ch.company_id = c.id

-- Relacionamento entre usuários e departamentos (adicionar a tabela correta aqui)
LEFT JOIN departaments_users du ON du.user_id = u.id
LEFT JOIN departaments d ON d.id = du.departament_id

WHERE u.login like $1
GROUP BY 
    u.id, c.id, r.id`,
      values: [login],
      rowMode: 'single'
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as User;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updateUser(user: User) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'UPDATE users SET' +
        'name = $1, email = $2, phone_number = $3, photo_url = $4, update_at = CURRENT_TIMESTAMP' +
        'WHERE id = $5',
      values: [
        user.name,
        user.email,
        user.phone_number,
        user.photo_url,
        user.id
      ]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updatePasswordUser(user: User) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE users SET password = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2',
      values: [user.password, user.id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function desactiveUser(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE users SET is_active = false, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function activeUser(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'UPDATE users SET is_active = true, update_at = CURRENT_TIMESTAMP WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function deleteUser(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM users WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
