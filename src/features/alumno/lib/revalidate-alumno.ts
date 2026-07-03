import { revalidatePath } from "next/cache";
import { revalidatePanelSection } from "@/lib/cache/revalidate-panel";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { ALUMNO_PROCESO_SUB_SLUGS } from "../constants/proceso-sections";
import type { AlumnoSectionSlug } from "../constants/sections";

export function revalidateAlumnoSection(section?: AlumnoSectionSlug) {
  revalidatePanelSection(PANEL_PATHS.alumno, section);

  if (section === "proceso") {
    revalidatePath(`${PANEL_PATHS.alumno}/proceso`);

    for (const subSection of ALUMNO_PROCESO_SUB_SLUGS) {
      if (subSection === "resumen") {
        continue;
      }

      revalidatePath(`${PANEL_PATHS.alumno}/proceso/${subSection}`);
    }
  }
}
