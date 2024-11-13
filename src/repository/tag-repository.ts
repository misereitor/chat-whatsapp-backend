import pool from '../config/pg_db.conf';
import { createTag, Tag } from '../model/tag-model';

export async function createTagRepository(tag: createTag) {
  const client = await pool.connect();
  try {
    const query = {
      text: `INSERT INTO tags (name, user_id, company_id, all_department, bg_color, text_color) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      values: [
        tag.name,
        tag.user_id,
        tag.company_id,
        tag.all_department,
        tag.bg_color,
        tag.text_color
      ]
    };
    const { rows } = await client.query(query);
    return rows[0] as Tag;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updateTagRepository(tag: Tag) {
  const client = await pool.connect();
  try {
    const query = {
      text: `UPDATE tags SET 
              name = $1, company_id = $2, all_department = $3, bg_color = $4, text_color = $5 
             WHERE id = $6`,
      values: [
        tag.name,
        tag.company_id,
        tag.all_department,
        tag.bg_color,
        tag.text_color,
        tag.id
      ]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getTagByIdRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        SELECT 
          t.*, 
          COALESCE(
                json_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL),
                '[]'::json
            ) AS departments
        FROM tags t
        LEFT JOIN tag_departments td ON t.id = td.tag_id
        LEFT JOIN departments d ON td.department_id = d.id
        WHERE t.id = $1
        GROUP BY t.id
      `,
      values: [id]
    };
    const { rows } = await client.query(query);
    return rows[0] as Tag & { departments: any[] };
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getTagsByUserRepository(
  user_id: number,
  company_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        SELECT 
            t.*,
            jsonb_build_object(
                'id', u.id,
                'name', u.name,
                'role', r.name
            ) AS users,
            COALESCE(
                json_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL),
                '[]'::json
            ) AS departments
        FROM tags t
        LEFT JOIN tag_departments td ON t.id = td.tag_id
        LEFT JOIN departments d ON td.department_id = d.id
        LEFT JOIN departments_users ud ON d.id = ud.department_id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN users_roles_companies urc ON u.id = urc.user_id AND t.company_id = urc.company_id
        LEFT JOIN roles r ON urc.role_id = r.id
        WHERE t.company_id = $1
          AND (t.user_id = $2 OR ud.user_id = $2 OR t.all_department = true)
        GROUP BY t.id, u.id, r.name

      `,
      values: [company_id, user_id]
    };
    const { rows } = await client.query(query);
    return rows.map((row) => ({
      ...row,
      departments: row.departments ?? []
    })) as (Tag & { departments: any[] })[];
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function deleteTagRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: `DELETE FROM tags WHERE id = $1`,
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function associateTagToDepartmentRepository(
  tag_id: number,
  department_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `INSERT INTO tag_departments (tag_id, department_id) VALUES ($1, $2)`,
      values: [tag_id, department_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function desassociateTagFromDepartmentRepository(
  tag_id: number,
  department_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `DELETE FROM tag_departments WHERE tag_id = $1 AND department_id = $2`,
      values: [tag_id, department_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function desassociateAllTagFromDepartmentRepository(
  tag_id: number
) {
  const client = await pool.connect();
  try {
    const query = {
      text: `DELETE FROM tag_departments WHERE tag_id = $1`,
      values: [tag_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getTagsByDepartmentRepository(department_id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        SELECT t.* 
        FROM tags t
        INNER JOIN tag_departments td ON t.id = td.tag_id
        WHERE td.department_id = $1
      `,
      values: [department_id]
    };
    const { rows } = await client.query(query);
    return rows as unknown as Tag[];
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
