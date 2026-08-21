import { NextResponse } from "next/server";
import { queryOne } from "../../../../db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    const row = await queryOne<{ ok: number }>("SELECT 1 AS ok");
    if (row?.ok !== 1) throw new Error("Database readiness query returned an unexpected result.");
    return NextResponse.json(
      { status: "ready", database: "ok", latencyMs: Date.now() - startedAt },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  } catch (error) {
    console.error("Readiness check failed", error);
    return NextResponse.json(
      { status: "unavailable", database: "unavailable" },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "30",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  }
}
