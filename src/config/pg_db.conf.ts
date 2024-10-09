import { config } from 'dotenv';
import { Pool } from 'pg';
config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: 5432
  // ssl: {
  //   rejectUnauthorized: true
  // }
});

export default pool;
