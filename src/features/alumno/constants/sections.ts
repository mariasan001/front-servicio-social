import { USER_ROLES } from "@/lib/auth/constants";
import {
  getRoleSectionSlugs,
  isRoleSectionSlug,
} from "@/features/panel/lib/sections";

export type AlumnoSectionSlug =
  | "inicio"
  | "vacantes"
  | "postulaciones"
  | "proceso"
  | "cv"
  | "notificaciones";

export const ALUMNO_SECTIONS = getRoleSectionSlugs(
  USER_ROLES.ALUMNO,
) as readonly AlumnoSectionSlug[];

export function isAlumnoSectionSlug(value: string): value is AlumnoSectionSlug {
  return isRoleSectionSlug(USER_ROLES.ALUMNO, value);
}
