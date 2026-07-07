import { USER_ROLES } from "@/lib/auth/constants";
import {
  getRoleSectionSlugs,
  isRoleSectionSlug,
} from "@/features/panel/lib/sections";

export type TitularSectionSlug =
  | "inicio"
  | "vacantes"
  | "postulaciones"
  | "procesos";

export const TITULAR_SECTIONS = getRoleSectionSlugs(
  USER_ROLES.TITULAR_AREA,
) as readonly TitularSectionSlug[];

export function isTitularSectionSlug(value: string): value is TitularSectionSlug {
  return isRoleSectionSlug(USER_ROLES.TITULAR_AREA, value);
}
