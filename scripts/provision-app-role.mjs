import pg from 'pg';
const { Client } = pg;

const adminUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_ADMIN_URL;
const user = process.env.APP_DATABASE_USER || 'tcp_app';
const password = process.env.APP_DATABASE_PASSWORD;
if (!adminUrl || !password) throw new Error('Set DATABASE_MIGRATION_URL (or DATABASE_ADMIN_URL) and APP_DATABASE_PASSWORD.');
if (!/^[a-z_][a-z0-9_]*$/i.test(user)) throw new Error('APP_DATABASE_USER contains unsupported characters.');
const q = (id) => `"${id.replaceAll('"','""')}"`;

const client = new Client({ connectionString: adminUrl });
await client.connect();
try {
  // DDL utility commands cannot safely rely on bind parameters for PASSWORD, so
  // ask Postgres itself to quote the secret and embed only the returned literal.
  const quoted = await client.query('SELECT quote_literal($1) AS password_literal, current_database() AS database_name', [password]);
  const passwordLiteral = quoted.rows[0].password_literal;
  const databaseName = quoted.rows[0].database_name;
  const exists = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [user]);
  if (!exists.rowCount) await client.query(`CREATE ROLE ${q(user)} LOGIN PASSWORD ${passwordLiteral} NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`);
  else await client.query(`ALTER ROLE ${q(user)} PASSWORD ${passwordLiteral} NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`);
  await client.query(`GRANT CONNECT ON DATABASE ${q(databaseName)} TO ${q(user)}`);
  await client.query(`GRANT USAGE ON SCHEMA public TO ${q(user)}`);
  await client.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${q(user)}`);
  await client.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${q(user)}`);
  await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${q(user)}`);
  await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${q(user)}`);
  console.log(`Least-privilege application role ${user} is ready.`);
} finally {
  await client.end();
}
