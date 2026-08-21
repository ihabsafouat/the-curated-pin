import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000, statement_timeout: 15_000 });
try {
  const results = {};
  const operations = [
    ["rate_limit_buckets", "DELETE FROM rate_limit_buckets WHERE expires_at < NOW() - INTERVAL '1 day'"],
    ["password_reset_tokens", "DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '7 days' OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days')"],
    ["refresh_sessions", "DELETE FROM refresh_sessions WHERE expires_at < NOW() - INTERVAL '7 days' OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '30 days')"],
    ["media_upload_authorizations", "DELETE FROM media_upload_authorizations WHERE expires_at < NOW() - INTERVAL '1 day'"],
  ];
  for (const [name, sql] of operations) {
    const result = await pool.query(sql);
    results[name] = result.rowCount ?? 0;
  }
  process.stdout.write(`${JSON.stringify({ ok: true, deleted: results })}\n`);
} finally {
  await pool.end();
}
