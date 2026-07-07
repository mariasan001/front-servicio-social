import type { LucideIcon } from "lucide-react";
import { Clock, FileText, Shield } from "lucide-react";
import { PANEL_PATHS } from "@/lib/auth/constants";

export type DelegacionValidacionSubSlug = "documentos" | "horas" | "incidencias";

export const DELEGACION_VALIDACION_BASE_PATH = `${PANEL_PATHS.delegacion}/validacion`;

export type DelegacionValidacionSubSection = {
  id: DelegacionValidacionSubSlug;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const DELEGACION_VALIDACION_NAV_TABS: readonly DelegacionValidacionSubSection[] = [
  {
    id: "documentos",
    label: "Documentos",
    description:
      "Valida la documentación enviada por los alumnos. Cuando todo esté aprobado, continúa la activación en Alumnos.",
    href: `${DELEGACION_VALIDACION_BASE_PATH}/documentos`,
    icon: FileText,
  },
  {
    id: "horas",
    label: "Horas",
    description: "Revisa y valida los registros de horas pendientes de los alumnos.",
    href: `${DELEGACION_VALIDACION_BASE_PATH}/horas`,
    icon: Clock,
  },
  {
    id: "incidencias",
    label: "Incidencias",
    description: "Consulta y resuelve incidencias reportadas durante el servicio social.",
    href: `${DELEGACION_VALIDACION_BASE_PATH}/incidencias`,
    icon: Shield,
  },
] as const;

export const DELEGACION_VALIDACION_SUB_SLUGS = DELEGACION_VALIDACION_NAV_TABS.map(
  (section) => section.id,
) as readonly DelegacionValidacionSubSlug[];

export function isDelegacionValidacionSubSlug(
  value: string,
): value is DelegacionValidacionSubSlug {
  return (DELEGACION_VALIDACION_SUB_SLUGS as readonly string[]).includes(value);
}

export function getDelegacionValidacionSubSection(id: DelegacionValidacionSubSlug) {
  return DELEGACION_VALIDACION_NAV_TABS.find((section) => section.id === id) ?? null;
}
