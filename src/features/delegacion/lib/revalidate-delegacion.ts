import { revalidatePath } from "next/cache";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { DelegacionSectionSlug } from "../constants/sections";
import type { DelegacionValidacionSubSlug } from "../constants/validacion-sections";

const VALIDACION_SUBSECTIONS = new Set<DelegacionValidacionSubSlug>([
  "documentos",
  "horas",
  "incidencias",
]);

export function revalidateDelegacionSection(
  section?: DelegacionSectionSlug | DelegacionValidacionSubSlug,
) {
  revalidatePath(PANEL_PATHS.delegacion);

  if (!section || section === "inicio") {
    return;
  }

  if (VALIDACION_SUBSECTIONS.has(section as DelegacionValidacionSubSlug)) {
    revalidatePath(`${PANEL_PATHS.delegacion}/validacion`);
    revalidatePath(`${PANEL_PATHS.delegacion}/validacion/${section}`);
    return;
  }

  revalidatePath(`${PANEL_PATHS.delegacion}/${section}`);
}
