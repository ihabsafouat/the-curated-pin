import { execute, queryOne, queryRows } from "./client";
import type { SafeUser, UserRole } from "./types";

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: "active" | "suspended";
  token_version: number;
  failed_login_count: number;
  locked_until: string | Date | null;
  last_failed_login_at: string | Date | null;
  created_at: string | Date;
};

export type UserWithPassword = SafeUser & { passwordHash: string; failedLoginCount: number; lockedUntil: string | null; lastFailedLoginAt: string | null };

function dateString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapUser(row: UserRow): UserWithPassword {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
    tokenVersion: Number(row.token_version),
    failedLoginCount: Number(row.failed_login_count ?? 0),
    lockedUntil: row.locked_until ? dateString(row.locked_until) : null,
    lastFailedLoginAt: row.last_failed_login_at ? dateString(row.last_failed_login_at) : null,
    createdAt: dateString(row.created_at),
  };
}

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  const row = await queryOne<UserRow>("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return row ? mapUser(row) : null;
}

export async function findUserById(id: string): Promise<UserWithPassword | null> {
  const row = await queryOne<UserRow>("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return row ? mapUser(row) : null;
}

export async function createUser(input: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}): Promise<UserWithPassword> {
  const row = await queryOne<UserRow>(
    `INSERT INTO users (id, name, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?) RETURNING *`,
    [input.id, input.name, input.email, input.passwordHash, input.role],
  );
  if (!row) throw new Error("Unable to create user.");
  return mapUser(row);
}

export async function listUsers(): Promise<SafeUser[]> {
  const rows = await queryRows<UserRow>("SELECT * FROM users ORDER BY created_at DESC");
  return rows.map((row) => {
    const user = mapUser(row);
    return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, tokenVersion: user.tokenVersion, createdAt: user.createdAt };
  });
}

export async function setUserRole(userId: string, role: UserRole): Promise<SafeUser | null> {
  const row = await queryOne<UserRow>(
    `UPDATE users SET role = ?, token_version = token_version + 1, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? RETURNING *`,
    [role, userId],
  );
  if (!row) return null;
  await execute("UPDATE refresh_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL", [
    userId,
  ]);
  return mapUser(row);
}

export async function registerLoginFailure(userId: string): Promise<{ lockedUntil: string | null; failedCount: number }> {
  const row = await queryOne<{ failed_login_count: number | string; locked_until: string | Date | null }>(
    `UPDATE users SET
      failed_login_count = CASE WHEN last_failed_login_at IS NULL OR last_failed_login_at < CURRENT_TIMESTAMP - INTERVAL '30 minutes' THEN 1 ELSE failed_login_count + 1 END,
      last_failed_login_at = CURRENT_TIMESTAMP,
      locked_until = CASE
        WHEN (CASE WHEN last_failed_login_at IS NULL OR last_failed_login_at < CURRENT_TIMESTAMP - INTERVAL '30 minutes' THEN 1 ELSE failed_login_count + 1 END) >= 7
        THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
        ELSE locked_until END,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ? RETURNING failed_login_count, locked_until`, [userId]);
  return { failedCount: Number(row?.failed_login_count ?? 0), lockedUntil: row?.locked_until ? dateString(row.locked_until) : null };
}

export async function clearLoginFailures(userId: string) {
  await execute(`UPDATE users SET failed_login_count = 0, locked_until = NULL, last_failed_login_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [userId]);
}

export async function changeUserPassword(userId: string, passwordHash: string): Promise<UserWithPassword | null> {
  const row = await queryOne<UserRow>(`UPDATE users SET password_hash = ?, token_version = token_version + 1, failed_login_count = 0, locked_until = NULL, last_failed_login_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`, [passwordHash, userId]);
  if (!row) return null;
  await execute(`UPDATE refresh_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL`, [userId]);
  return mapUser(row);
}

export async function createPasswordResetToken(input: { id: string; userId: string; tokenHash: string; expiresAt: string }) {
  await execute(`DELETE FROM password_reset_tokens WHERE user_id = ? OR expires_at < CURRENT_TIMESTAMP OR used_at IS NOT NULL`, [input.userId]);
  await execute(`INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`, [input.id, input.userId, input.tokenHash, input.expiresAt]);
}

export async function consumePasswordResetToken(tokenHash: string): Promise<UserWithPassword | null> {
  const row = await queryOne<{ user_id: string }>(`UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP RETURNING user_id`, [tokenHash]);
  if (!row) return null;
  return findUserById(row.user_id);
}

export async function createRefreshSession(input: {
  id: string;
  userId: string;
  tokenHash: string;
  ipHash: string | null;
  userAgentHash: string | null;
  expiresAt: string;
}) {
  await execute(
    `INSERT INTO refresh_sessions (id, user_id, token_hash, ip_hash, user_agent_hash, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.id, input.userId, input.tokenHash, input.ipHash, input.userAgentHash, input.expiresAt],
  );
}

export async function rotateRefreshSession(input: {
  id: string;
  userId: string;
  oldTokenHash: string;
  newTokenHash: string;
  expiresAt: string;
}): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `UPDATE refresh_sessions SET token_hash = ?, expires_at = ?
     WHERE id = ? AND user_id = ? AND token_hash = ? AND revoked_at IS NULL AND expires_at > ?
     RETURNING id`,
    [input.newTokenHash, input.expiresAt, input.id, input.userId, input.oldTokenHash, new Date().toISOString()],
  );
  return Boolean(row);
}

export async function revokeRefreshSession(id: string, tokenHash: string) {
  await execute(
    "UPDATE refresh_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ? AND token_hash = ? AND revoked_at IS NULL",
    [id, tokenHash],
  );
}

export async function consumeRateLimitBucket(input: {
  bucketKey: string;
  scope: string;
  windowStart: number;
  expiresAt: string;
}): Promise<number> {
  const row = await queryOne<{ count: number | string }>(
    `INSERT INTO rate_limit_buckets (bucket_key, scope, window_start, count, expires_at)
     VALUES (?, ?, ?, 1, ?)
     ON CONFLICT(bucket_key, scope, window_start)
     DO UPDATE SET count = rate_limit_buckets.count + 1, expires_at = excluded.expires_at
     RETURNING count`,
    [input.bucketKey, input.scope, input.windowStart, input.expiresAt],
  );
  if (Math.random() < 0.01) {
    await execute("DELETE FROM rate_limit_buckets WHERE expires_at < ?", [new Date().toISOString()]).catch(() => {});
  }
  return Number(row?.count ?? 1);
}

export async function writeAuditLog(input: {
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipHash?: string | null;
}) {
  await execute(
    `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, metadata_json, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.actorUserId,
      input.action.slice(0, 100),
      input.targetType.slice(0, 60),
      input.targetId?.slice(0, 120) ?? null,
      JSON.stringify(input.metadata ?? {}).slice(0, 4000),
      input.ipHash ?? null,
    ],
  );
}

export type AuditLogRow = {
  id: number;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export async function listAuditLogs(limit = 200): Promise<AuditLogRow[]> {
  const rows = await queryRows<{ id: number | string; actor_user_id: string | null; action: string; target_type: string; target_id: string | null; metadata_json: string | Record<string, unknown>; created_at: string | Date }>(
    `SELECT id, actor_user_id, action, target_type, target_id, metadata_json, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ?`,
    [Math.max(1, Math.min(500, Math.trunc(limit)))],
  );
  return rows.map((row) => {
    let metadata: Record<string, unknown> = {};
    try { metadata = typeof row.metadata_json === "string" ? JSON.parse(row.metadata_json) : row.metadata_json ?? {}; } catch {}
    return { id: Number(row.id), actorUserId: row.actor_user_id, action: row.action, targetType: row.target_type, targetId: row.target_id, metadata, createdAt: dateString(row.created_at) };
  });
}
