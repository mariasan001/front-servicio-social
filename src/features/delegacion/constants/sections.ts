import { USER_ROLES } from "@/lib/auth/constants";
import {
  getRoleSectionSlugs,
  isRoleSectionSlug,
} from "@/features/panel/lib/sections";

export type DelegacionSectionSlug =
  | "inicio"
  | "vacantes"
  | "postulaciones"
  | "procesos"
  | "validacion"
  | "alumnos"
  | "reportes";

export const DELEGACION_SECTIONS = getRoleSectionSlugs(
  USER_ROLES.DELEGACION,
) as readonly DelegacionSectionSlug[];

export function isDelegacionSectionSlug(
  value: string,
): value is DelegacionSectionSlug {
  return isRoleSectionSlug(USER_ROLES.DELEGACION, value);
}
