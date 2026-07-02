import { revalidatePanelSection } from "@/lib/cache/revalidate-panel";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { EnlaceSectionSlug } from "../constants/sections";

export function revalidateEnlaceSection(section?: EnlaceSectionSlug) {
  revalidatePanelSection(PANEL_PATHS.enlace, section);
}
