import { revalidatePanelSection } from "@/lib/cache/revalidate-panel";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { EnlaceSectionSlug } from "../constants/endpoints";

export function revalidateEnlaceSection(section?: EnlaceSectionSlug) {
  revalidatePanelSection(PANEL_PATHS.enlace, section);
}
