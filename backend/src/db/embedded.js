import EmbeddedPostgres from 'embedded-postgres';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

// Spins up a fully self-contained PostgreSQL instance that runs WITHOUT root /
// sudo. The binary is downloaded once by the `embedded-postgres` package and
// the data lives in backend/.pgdata. This lets the whole app run on machines
// where PostgreSQL isn't installed system-wide.
//
// Usage:  npm run db:start   (keep this running in its own terminal)
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', '..', '.pgdata');

const port = Number(process.env.PGPORT) || 5432;
const user = process.env.PGUSER || 'postgres';
const password = process.env.PGPASSWORD || 'postgres';
const database = process.env.PGDATABASE || 'student_management';

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user,
  password,
  port,
  persistent: true,
});

async function main() {
  // initialise() formats a fresh data directory; only do it the first time.
  const alreadyInitialised = existsSync(join(dataDir, 'PG_VERSION'));
  if (!alreadyInitialised) {
    console.log('📦 Initialising PostgreSQL data directory (first run)…');
    await pg.initialise();
  }

  console.log('🐘 Starting embedded PostgreSQL…');
  await pg.start();

  // Create the application database if it doesn't exist yet.
  try {
    await pg.createDatabase(database);
    console.log(`✅ Created database "${database}".`);
  } catch (err) {
    if (/already exists/i.test(err.message)) {
      console.log(`ℹ️  Database "${database}" already exists.`);
    } else {
      throw err;
    }
  }

  // Apply the schema (idempotent) directly against the new database.
  const client = pg.getPgClient(database);
  await client.connect();
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  await client.query(schema);
  await client.end();
  console.log('✅ Schema applied.');

  console.log(`\n🚀 PostgreSQL ready on localhost:${port} (db: ${database})`);
  console.log('   Leave this terminal running. Start the API with:  npm run dev\n');
}

// Graceful shutdown so the data directory isn't left locked.
async function shutdown() {
  console.log('\n🛑 Stopping PostgreSQL…');
  try {
    await pg.stop();
  } catch {
    /* ignore */
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((err) => {
  console.error('❌ Failed to start embedded PostgreSQL:', err.message);
  process.exit(1);
});
