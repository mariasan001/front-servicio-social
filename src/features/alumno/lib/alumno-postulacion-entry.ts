import { PANEL_PATHS } from "@/lib/auth/constants";
import { isSafeInternalPath } from "@/lib/auth/roles";

export const ALUMNO_POSTULACION_ENTRY_PATH = `${PANEL_PATHS.alumno}/vacantes` as const;
export const ALUMNO_CV_POSTULACION_MOTIVO = "postulacion" as const;

export function buildAlumnoPostulacionLoginHref(loginPath: string) {
  return `${loginPath}?next=${encodeURIComponent(ALUMNO_POSTULACION_ENTRY_PATH)}`;
}

export function buildAlumnoPostulacionRegisterHref(registerPath: string) {
  return `${registerPath}?next=${encodeURIComponent(ALUMNO_POSTULACION_ENTRY_PATH)}`;
}

export function buildAlumnoCvPostulacionUrl() {
  return `${PANEL_PATHS.alumno}/cv?motivo=${ALUMNO_CV_POSTULACION_MOTIVO}`;
}

export function isAlumnoPostulacionEntryPath(path: string | null | undefined) {
  if (!isSafeInternalPath(path)) {
    return false;
  }

  const safePath = path as string;
  const vacantes = `${PANEL_PATHS.alumno}/vacantes`;
  const postulaciones = `${PANEL_PATHS.alumno}/postulaciones`;

  return (
    safePath === vacantes ||
    safePath.startsWith(`${vacantes}/`) ||
    safePath === postulaciones ||
    safePath.startsWith(`${postulaciones}/`)
  );
}

export function hasAlumnoCvPostulacionMotivo(motivo: string | null | undefined) {
  return motivo === ALUMNO_CV_POSTULACION_MOTIVO;
}
