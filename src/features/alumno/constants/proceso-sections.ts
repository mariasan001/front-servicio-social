import type { LucideIcon } from "lucide-react";
import { Clock, FileText, LayoutGrid, ScrollText, Shield } from "lucide-react";
import { PANEL_PATHS } from "@/lib/auth/constants";

export type AlumnoProcesoSubSlug =
  | "resumen"
  | "horas"
  | "documentos"
  | "cartas"
  | "incidencias";

export const ALUMNO_PROCESO_BASE_PATH = `${PANEL_PATHS.alumno}/proceso`;

export type AlumnoProcesoSubSection = {
  id: AlumnoProcesoSubSlug;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const ALUMNO_PROCESO_NAV_TABS: readonly AlumnoProcesoSubSection[] = [
  {
    id: "resumen",
    label: "Resumen",
    description: "Consulta el avance general de tu proceso.",
    href: ALUMNO_PROCESO_BASE_PATH,
    icon: LayoutGrid,
  },
  {
    id: "horas",
    label: "Registro de horas",
    description: "Consulta tu calendario y registra la asistencia del día.",
    href: `${ALUMNO_PROCESO_BASE_PATH}/horas`,
    icon: Clock,
  },
  {
    id: "documentos",
    label: "Mi documentación",
    description: "Sube y consulta los archivos solicitados para tu proceso.",
    href: `${ALUMNO_PROCESO_BASE_PATH}/documentos`,
    icon: FileText,
  },
  {
    id: "cartas",
    label: "Mis cartas",
    description: "Descarga las cartas emitidas por la dependencia.",
    href: `${ALUMNO_PROCESO_BASE_PATH}/cartas`,
    icon: ScrollText,
  },
  {
    id: "incidencias",
    label: "Mis incidencias",
    description: "Revisa los eventos registrados durante tu proceso.",
    href: `${ALUMNO_PROCESO_BASE_PATH}/incidencias`,
    icon: Shield,
  },
] as const;

export const ALUMNO_PROCESO_SUB_SECTIONS = ALUMNO_PROCESO_NAV_TABS.filter(
  (section) => section.id !== "resumen",
);

export const ALUMNO_PROCESO_SUB_SLUGS = [
  "resumen",
  ...ALUMNO_PROCESO_SUB_SECTIONS.map((section) => section.id),
] as const;

export function isAlumnoProcesoSubSlug(value: string): value is AlumnoProcesoSubSlug {
  return (ALUMNO_PROCESO_SUB_SLUGS as readonly string[]).includes(value);
}

export function getAlumnoProcesoSubSection(id: AlumnoProcesoSubSlug) {
  return ALUMNO_PROCESO_SUB_SECTIONS.find((section) => section.id === id) ?? null;
}
