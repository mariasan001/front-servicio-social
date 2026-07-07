import type { LucideIcon } from "lucide-react";
import { GraduationCap, Shield } from "lucide-react";
import { PANEL_PATHS } from "@/lib/auth/constants";

export type TitularSeguimientoTab = "alumnos" | "incidencias";

export const TITULAR_SEGUIMIENTO_BASE_PATH = `${PANEL_PATHS.titular}/procesos`;

export type TitularSeguimientoTabConfig = {
  id: TitularSeguimientoTab;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const TITULAR_SEGUIMIENTO_TABS: readonly TitularSeguimientoTabConfig[] = [
  {
    id: "alumnos",
    label: "Alumnos",
    description:
      "Registra horas e incidencias, y da seguimiento a liberación técnica y evaluación final por alumno.",
    href: TITULAR_SEGUIMIENTO_BASE_PATH,
    icon: GraduationCap,
  },
  {
    id: "incidencias",
    label: "Bandeja de incidencias",
    description:
      "Consulta las incidencias reportadas en tu área. Para registrar una nueva, abre el alumno en la pestaña Alumnos.",
    href: `${TITULAR_SEGUIMIENTO_BASE_PATH}/incidencias`,
    icon: Shield,
  },
] as const;

export function getTitularSeguimientoTab(id: TitularSeguimientoTab) {
  return TITULAR_SEGUIMIENTO_TABS.find((tab) => tab.id === id) ?? TITULAR_SEGUIMIENTO_TABS[0];
}
