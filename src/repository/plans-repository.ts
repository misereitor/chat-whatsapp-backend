import pool from '../config/pg_db.conf';
import { AssociatePlan, Plan } from '../model/plans-model';

export async function createPlansRepository(plan: Plan) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO plans (name, max_admins, max_supervisors, max_users) ' +
        'VALUES ' +
        '($1, $2, $3, $4) RETURNING *',
      values: [plan.name, plan.max_admins, plan.max_supervisors, plan.max_users]
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as Plan;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getAllPlansRepository() {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM plans'
    };
    const { rows } = await client.query(query);
    return rows as unknown as Plan[];
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getPlanByNameRepository(planName: string) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM plans WHERE name like ($1)',
      values: [planName]
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as Plan;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getPlanByAssociationRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM companies_plans WHERE plan_id = $1',
      values: [id]
    };
    const { rows } = await client.query(query);
    return rows as unknown as AssociatePlan[];
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getPlanByIdRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'SELECT * FROM plans WHERE id = $1',
      values: [id]
    };
    const { rows } = await client.query(query);
    return rows[0] as unknown as Plan;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function updatePlansRepository(plan: Plan) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'UPDATE plans SET ' +
        'name = $1, max_admins =$2, max_supervisors = $3, max_users = $4 ' +
        'WHERE id = $5',
      values: [
        plan.name,
        plan.max_admins,
        plan.max_supervisors,
        plan.max_users,
        plan.id
      ]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function associatePlansRepository(plan: AssociatePlan) {
  const client = await pool.connect();
  try {
    const query = {
      text:
        'INSERT INTO companies_plans (company_id, plan_id, end_date) ' +
        'VALUES ' +
        '($1, $2, $3) RETURNING *',
      values: [plan.company_id, plan.plan_id, plan.end_date]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function removeAllAssociationPlanByCompany(company_id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM companies_plans WHERE company_id = $1 ',
      values: [company_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function desassociatePlansRepository(plan: AssociatePlan) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM companies_plans WHERE company_id = $1 AND plan_id = $2 ',
      values: [plan.company_id, plan.plan_id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function deletePlansRepository(id: number) {
  const client = await pool.connect();
  try {
    const query = {
      text: 'DELETE FROM plans WHERE id = $1',
      values: [id]
    };
    await client.query(query);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
