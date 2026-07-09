import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/types";
import type { UserRole } from "@/lib/auth/constants";
import { hasAnyRole, normalizeAuthUser } from "@/lib/auth/roles";
import { requireServerSession } from "@/lib/auth/session.server";

export async function requireActionSession(requiredRoles?: UserRole[]): Promise<AuthUser> {
  const session = await requireServerSession();
  const user = normalizeAuthUser(session);

  if (requiredRoles?.length && !hasAnyRole(user.roles, requiredRoles)) {
    redirect("/login");
  }

  return user;
}
