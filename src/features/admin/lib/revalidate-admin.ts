import { revalidatePanelSection } from "@/lib/cache/revalidate-panel";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AdminSectionSlug } from "../constants/sections";

export function revalidateAdminSection(section?: AdminSectionSlug) {
  revalidatePanelSection(PANEL_PATHS.admin, section);
}
