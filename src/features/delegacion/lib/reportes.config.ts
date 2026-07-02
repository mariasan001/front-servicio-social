import { resolveApiUrl } from "@/lib/api/client";

export const DELEGACION_REPORTS = [
  {
    id: "vacantes",
    label: "Vacantes",
    listPath: "/api/delegacion/reportes/vacantes",
    exportPath: "/api/delegacion/reportes/vacantes/export",
  },
  {
    id: "postulaciones",
    label: "Postulaciones",
    listPath: "/api/delegacion/reportes/postulaciones",
    exportPath: "/api/delegacion/reportes/postulaciones/export",
  },
  {
    id: "procesos",
    label: "Procesos",
    listPath: "/api/delegacion/reportes/procesos",
    exportPath: "/api/delegacion/reportes/procesos/export",
  },
  {
    id: "liberaciones",
    label: "Liberaciones",
    listPath: "/api/delegacion/reportes/liberaciones",
    exportPath: "/api/delegacion/reportes/liberaciones/export",
  },
  {
    id: "incidencias",
    label: "Incidencias",
    listPath: "/api/delegacion/reportes/incidencias",
    exportPath: "/api/delegacion/reportes/incidencias/export",
  },
  {
    id: "horas",
    label: "Horas",
    listPath: "/api/delegacion/reportes/horas",
    exportPath: "/api/delegacion/reportes/horas/export",
  },
  {
    id: "documentos",
    label: "Documentos",
    listPath: "/api/delegacion/reportes/documentos",
    exportPath: "/api/delegacion/reportes/documentos/export",
  },
] as const;

export type DelegacionReportId = (typeof DELEGACION_REPORTS)[number]["id"];

export function getDelegacionReportDefinition(id: DelegacionReportId) {
  const definition = DELEGACION_REPORTS.find((report) => report.id === id);

  if (!definition) {
    throw new Error(`Reporte no configurado: ${id}`);
  }

  return definition;
}

export function buildDelegacionReportExportUrl(id: DelegacionReportId) {
  return resolveApiUrl(getDelegacionReportDefinition(id).exportPath);
}
