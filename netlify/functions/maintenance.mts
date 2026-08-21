import { Pool } from "pg";

export default async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return new Response("DATABASE_URL missing", { status: 503 });
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000, statement_timeout: 15_000 });
  try {
    const statements = [
      "DELETE FROM rate_limit_buckets WHERE expires_at < NOW() - INTERVAL '1 day'",
      "DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '7 days' OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days')",
      "DELETE FROM refresh_sessions WHERE expires_at < NOW() - INTERVAL '7 days' OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '30 days')",
      "DELETE FROM media_upload_authorizations WHERE expires_at < NOW() - INTERVAL '1 day'",
    ];
    let deleted = 0;
    for (const sql of statements) deleted += (await pool.query(sql)).rowCount ?? 0;
    return new Response(JSON.stringify({ ok: true, deleted }), { headers: { "content-type": "application/json" } });
  } finally {
    await pool.end();
  }
};
