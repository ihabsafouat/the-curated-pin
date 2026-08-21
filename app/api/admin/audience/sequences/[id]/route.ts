import { updateEmailSequenceStatus } from "../../../../../../db/audience";
import { writeAuditLog } from "../../../../../../db/auth";
import { getCurrentUser, roleAtLeast } from "../../../../../security/auth";
import { clientIpHash } from "../../../../../security/rate-limit";
import { csrfMatches, readForm, requestHasSafeOrigin } from "../../../../../security/request";
import { sequenceStatusSchema } from "../../../../../security/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requestHasSafeOrigin(request)) return new Response("Forbidden", { status: 403 });
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "editor")) return new Response("Forbidden", { status: 403 });
  const form = await readForm(request);
  if (!form || !await csrfMatches(form.get("_csrf"))) return new Response("Invalid request", { status: 403 });
  const { id } = await params;
  const parsed = sequenceStatusSchema.safeParse({ id, status: String(form.get("status") || "") });
  if (!parsed.success) return new Response("Invalid sequence status", { status: 400 });
  const changed = await updateEmailSequenceStatus(parsed.data.id, parsed.data.status);
  if (!changed) return new Response("Sequence not found", { status: 404 });
  await writeAuditLog({ actorUserId: user.id, action: "audience.sequence_status", targetType: "email_sequence", targetId: String(parsed.data.id), metadata: { status: parsed.data.status }, ipHash: await clientIpHash(request) });
  return Response.redirect(new URL("/studio/audience", request.url), 303);
}
