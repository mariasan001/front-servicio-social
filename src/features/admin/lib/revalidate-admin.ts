import type { AdminSectionSlug } from "../constants/sections";
import { revalidateAdminPanelSection } from "@/lib/cache/revalidate-roles";

export function revalidateAdminSection(section?: AdminSectionSlug) {
  revalidateAdminPanelSection(section);
}
