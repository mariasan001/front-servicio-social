import { revalidatePanelSection } from "@/lib/cache/revalidate-panel";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AlumnoSectionSlug } from "../constants/endpoints";

export function revalidateAlumnoSection(section?: AlumnoSectionSlug) {
  revalidatePanelSection(PANEL_PATHS.alumno, section);
}
