import { PANEL_PATHS } from "@/lib/auth/constants";
import { revalidatePanelSection } from "./revalidate-panel";

const VALIDACION_SUBSECTIONS = new Set([
  "documentos",
  "horas",
  "incidencias",
]);

export function revalidateDelegacionPanelSection(section?: string) {
  if (!section || section === "inicio") {
    revalidatePanelSection(PANEL_PATHS.delegacion);
    return;
  }

  if (VALIDACION_SUBSECTIONS.has(section)) {
    revalidatePanelSection(PANEL_PATHS.delegacion, "validacion");
    revalidatePanelSection(PANEL_PATHS.delegacion, `validacion/${section}`);
    return;
  }

  revalidatePanelSection(PANEL_PATHS.delegacion, section);
}

export function revalidateAdminPanelSection(section?: string) {
  revalidatePanelSection(PANEL_PATHS.admin, section);
}

export function revalidateAlumnoPanelSection(section?: string) {
  revalidatePanelSection(PANEL_PATHS.alumno, section);
}

export function revalidateEnlacePanelSection(section?: string) {
  revalidatePanelSection(PANEL_PATHS.enlace, section);
}
