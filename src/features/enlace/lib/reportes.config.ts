import { resolveApiUrl } from "@/lib/api/client";

export const ENLACE_REPORTE_ALUMNOS_EXPORT_PATH = "/api/enlace/reportes/alumnos/export";

export function buildEnlaceReporteAlumnosExportUrl() {
  return resolveApiUrl(ENLACE_REPORTE_ALUMNOS_EXPORT_PATH);
}
