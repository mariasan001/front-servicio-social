import type { NextRequest } from "next/server";
import type { AuthUser } from "@/lib/api/types";
import { USER_ROLES } from "@/lib/auth/constants";
import { getCvFromRequest } from "@/lib/auth/alumno-cv-request";
import {
  buildAlumnoCvPostulacionUrl,
  isAlumnoPostulacionEntryPath,
} from "@/lib/auth/postulacion-entry";
import {
  canAccessPath,
  hasAnyRole,
  isSafeInternalPath,
  normalizeAuthUser,
  resolveHomePath,
} from "@/lib/auth/roles";
import { isCvComplete } from "@/lib/domain/cv";

export async function resolveGuestAuthRedirect(
  session: AuthUser,
  nextPath: string | null | undefined,
  request: NextRequest,
): Promise<string> {
  const normalizedSession = normalizeAuthUser(session);
  const homePath = resolveHomePath(normalizedSession.roles);

  const destination =
    isSafeInternalPath(nextPath) && canAccessPath(normalizedSession, nextPath as string)
      ? (nextPath as string)
      : homePath;

  if (
    hasAnyRole(normalizedSession.roles, [USER_ROLES.ALUMNO]) &&
    isAlumnoPostulacionEntryPath(destination)
  ) {
    const cv = await getCvFromRequest(request);

    if (!isCvComplete(cv)) {
      return buildAlumnoCvPostulacionUrl();
    }
  }

  return destination;
}
