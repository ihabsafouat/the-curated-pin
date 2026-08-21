import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
const email = String(process.argv[2] ?? "").trim().toLowerCase();
if (!databaseUrl) throw new Error("DATABASE_URL is required.");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Pass the registered admin email as the first argument.");

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  const result = await client.query(
    "UPDATE users SET role = 'admin', token_version = token_version + 1, updated_at = CURRENT_TIMESTAMP WHERE email = $1 RETURNING id",
    [email],
  );
  if (!result.rowCount) throw new Error("No registered user has that email.");
  await client.query("UPDATE refresh_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL", [result.rows[0].id]);
  process.stdout.write(`Promoted ${email} to admin. Sign in again to refresh permissions.\n`);
} finally {
  await client.end();
}
