import { Pool } from "pg";

type QueryParams = readonly unknown[];
type Statement = { text: string; params?: QueryParams };
type ScopedQueryResult = { rows: unknown[]; rowCount: number | null };

let pool: Pool | null = null;

export function databaseIsConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function getPostgresPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Set it to your PostgreSQL/Neon connection string.");
  }

  // Keep each server instance conservative. For Neon, use the pooled
  // connection string (hostname contains `-pooler`) in production.
  pool = new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    statement_timeout: 12_000,
    query_timeout: 15_000,
    application_name: "the-curated-pin",
    allowExitOnIdle: true,
  });
  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error", error);
  });
  return pool;
}

function postgresPlaceholders(text: string): string {
  let index = 0;
  return text.replace(/\?/g, () => `$${++index}`);
}

export async function queryRows<T>(text: string, params: QueryParams = []): Promise<T[]> {
  const result = await getPostgresPool().query(postgresPlaceholders(text), [...params]);
  return result.rows as T[];
}

export async function queryOne<T>(text: string, params: QueryParams = []): Promise<T | null> {
  const rows = await queryRows<T>(text, params);
  return rows[0] ?? null;
}

export async function execute(text: string, params: QueryParams = []): Promise<number> {
  const result = await getPostgresPool().query(postgresPlaceholders(text), [...params]);
  return result.rowCount ?? 0;
}

async function withUserContext<T>(userId: string, run: (query: (text: string, params?: QueryParams) => Promise<ScopedQueryResult>) => Promise<T>): Promise<T> {
  const client = await getPostgresPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
    const scoped = (text: string, params: QueryParams = []) => client.query(postgresPlaceholders(text), [...params]);
    const value = await run(scoped);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function queryRowsAsUser<T>(userId: string, text: string, params: QueryParams = []): Promise<T[]> {
  return withUserContext(userId, async (query) => (await query(text, params)).rows as T[]);
}

export async function executeAsUser(userId: string, text: string, params: QueryParams = []): Promise<number> {
  return withUserContext(userId, async (query) => (await query(text, params)).rowCount ?? 0);
}

export async function executeBatch(statements: Statement[]): Promise<void> {
  if (!statements.length) return;
  const client = await getPostgresPool().connect();
  try {
    await client.query("BEGIN");
    for (const statement of statements) {
      await client.query(postgresPlaceholders(statement.text), [...(statement.params ?? [])]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
