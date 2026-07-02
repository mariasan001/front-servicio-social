import { revalidatePanelSection } from "@/lib/cache/revalidate-panel";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { DelegacionSectionSlug } from "../constants/endpoints";

export function revalidateDelegacionSection(section?: DelegacionSectionSlug) {
  revalidatePanelSection(PANEL_PATHS.delegacion, section);
}
