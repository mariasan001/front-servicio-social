import { USER_ROLES } from "@/lib/auth/constants";
import {
  getRoleSectionSlugs,
  isRoleSectionSlug,
} from "@/features/panel/lib/sections";

export type EnlaceSectionSlug = "inicio" | "alumnos" | "procesos" | "reportes";

export const ENLACE_SECTIONS = getRoleSectionSlugs(
  USER_ROLES.ENLACE_ESCOLAR,
) as readonly EnlaceSectionSlug[];

export function isEnlaceSectionSlug(value: string): value is EnlaceSectionSlug {
  return isRoleSectionSlug(USER_ROLES.ENLACE_ESCOLAR, value);
}
