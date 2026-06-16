import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Prefer a single DATABASE_URL when provided (common on hosting platforms),
// otherwise fall back to the individual PG* environment variables.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'student_management',
    });

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

// Thin helper so callers don't need to grab a client for one-off queries.
export const query = (text, params) => pool.query(text, params);

export default pool;
