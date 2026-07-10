import type { EnlaceSectionSlug } from "../constants/sections";
import { revalidateEnlacePanelSection } from "@/lib/cache/revalidate-roles";

export function revalidateEnlaceSection(section?: EnlaceSectionSlug) {
  revalidateEnlacePanelSection(section);
}
