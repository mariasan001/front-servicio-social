import { apiRequest } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";
import { USER_ROLES } from "@/lib/auth/constants";
import {
  canAccessPath,
  hasAnyRole,
  isSafeInternalPath,
  normalizeAuthUser,
  resolveHomePath,
} from "@/lib/auth/roles";
import { isCvComplete } from "@/features/alumno/components/cv/cv-labels";
import {
  buildAlumnoCvPostulacionUrl,
  isAlumnoPostulacionEntryPath,
} from "@/features/alumno/lib/alumno-postulacion-entry";
import type { CvResponse } from "@/features/alumno/types/alumno.types";

export async function resolveLoginRedirect(
  user: AuthUser,
  nextPath?: string,
): Promise<string> {
  const session = normalizeAuthUser(user);
  const fallback = resolveHomePath(session.roles);

  if (!isSafeInternalPath(nextPath)) {
    return fallback;
  }

  const safeNextPath = nextPath as string;

  if (!canAccessPath(session, safeNextPath)) {
    return fallback;
  }

  if (
    hasAnyRole(session.roles, [USER_ROLES.ALUMNO]) &&
    isAlumnoPostulacionEntryPath(safeNextPath)
  ) {
    try {
      const response = await apiRequest<CvResponse>("/api/alumno/cv", {
        method: "GET",
      });

      if (!isCvComplete(response.data)) {
        return buildAlumnoCvPostulacionUrl();
      }
    } catch {
      // Si el CV aún no se puede leer, el guard del panel redirige a Mi CV.
    }
  }

  return safeNextPath;
}
