import { getCurrentUser } from "../../../security/auth";

export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ authenticated: Boolean(user), user }, { status: user ? 200 : 401 });
}
