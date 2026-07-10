import type { DelegacionSectionSlug } from "../constants/sections";
import type { DelegacionValidacionSubSlug } from "../constants/validacion-sections";
import { revalidateDelegacionPanelSection } from "@/lib/cache/revalidate-roles";

export function revalidateDelegacionSection(
  section?: DelegacionSectionSlug | DelegacionValidacionSubSlug,
) {
  revalidateDelegacionPanelSection(section);
}
