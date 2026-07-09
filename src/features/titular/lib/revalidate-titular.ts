import type { TitularSectionSlug } from "@/features/titular/constants/sections";
import { revalidateTitularPanelSection } from "@/lib/cache/revalidate-titular";

export function revalidateTitularSection(section?: TitularSectionSlug) {
  revalidateTitularPanelSection(section);
}
