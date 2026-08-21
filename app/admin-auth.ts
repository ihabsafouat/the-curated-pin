import { authIsConfigured, getCurrentUser, requireRole, roleAtLeast } from "./security/auth";

export function adminIsConfigured() {
  return authIsConfigured();
}

export async function isAdminUser() {
  const user = await getCurrentUser();
  return user && roleAtLeast(user, "author") ? user : null;
}

export async function requireAdmin(returnTo = "/studio") {
  return requireRole("author", returnTo);
}
