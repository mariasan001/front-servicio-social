import type { AuthUser } from "@/lib/api/types";
import {
  AUTH_PATHS,
  PANEL_PATHS,
  PANEL_ROLE_ACCESS,
  ROLE_HOME_PATHS,
  ROLE_PRIORITY,
  type UserRole,
} from "./constants";

export function normalizeRoles(roles: string[] | undefined | null) {
  return roles?.filter(Boolean) ?? [];
}

export function hasAnyRole(
  userRoles: string[] | undefined | null,
  requiredRoles: UserRole[],
) {
  const normalized = normalizeRoles(userRoles);
  return requiredRoles.some((role) => normalized.includes(role));
}

export function getPrimaryRole(roles: string[] | undefined | null): UserRole | null {
  const normalized = normalizeRoles(roles);

  for (const role of ROLE_PRIORITY) {
    if (normalized.includes(role)) {
      return role;
    }
  }

  return null;
}

export function resolveHomePath(roles: string[] | undefined | null) {
  const primaryRole = getPrimaryRole(roles);
  return primaryRole ? ROLE_HOME_PATHS[primaryRole] : AUTH_PATHS.home;
}

export function getRequiredRolesForPath(pathname: string): UserRole[] | null {
  const match = Object.entries(PANEL_ROLE_ACCESS).find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match ? match[1] : null;
}

export function canAccessPath(user: AuthUser | null, pathname: string) {
  if (!user) {
    return false;
  }

  const requiredRoles = getRequiredRolesForPath(pathname);

  if (!requiredRoles) {
    return (
      pathname === PANEL_PATHS.root ||
      pathname.startsWith(`${PANEL_PATHS.root}/`)
    );
  }

  return hasAnyRole(user.roles, requiredRoles);
}

export function isSafeInternalPath(path: string | null | undefined) {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}
