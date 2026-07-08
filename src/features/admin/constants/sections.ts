import { USER_ROLES } from "@/lib/auth/constants";
import {
  getRoleSectionSlugs,
  isRoleSectionSlug,
} from "@/features/panel/lib/sections";

export type AdminSectionSlug =
  | "inicio"
  | "dependencias"
  | "escuelas"
  | "areas"
  | "examenes"
  | "usuarios";

export const ADMIN_SECTIONS = getRoleSectionSlugs(
  USER_ROLES.ADMINISTRADOR,
) as readonly AdminSectionSlug[];

export function isAdminSectionSlug(value: string): value is AdminSectionSlug {
  return isRoleSectionSlug(USER_ROLES.ADMINISTRADOR, value);
}
