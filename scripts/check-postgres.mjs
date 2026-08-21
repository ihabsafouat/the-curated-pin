import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  const result = await client.query("SELECT current_database() AS database, current_user AS user, NOW() AS now");
  process.stdout.write(`PostgreSQL connection OK: ${result.rows[0].database} as ${result.rows[0].user}\n`);
} finally {
  await client.end();
}
