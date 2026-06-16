import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pool from './pool.js';

// Runs schema.sql against the configured database. Safe to run repeatedly
// because the schema uses IF NOT EXISTS / CREATE OR REPLACE everywhere.
const __dirname = dirname(fileURLToPath(import.meta.url));

async function init() {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  try {
    await pool.query(sql);
    console.log('✅ Database schema applied successfully.');
  } catch (err) {
    console.error('❌ Failed to apply schema:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
