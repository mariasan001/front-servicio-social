import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type { ReportPageResponse } from "@/lib/api/types";
import {
  DELEGACION_REPORTS,
  getDelegacionReportDefinition,
  type DelegacionReportId,
} from "../lib/reportes.config";
import type { ReportQueryFilters } from "../types/delegacion.types";

async function fetchReportPage(path: string, filters?: ReportQueryFilters) {
  const response = await serverApiRequest<ReportPageResponse<unknown>>(
    `${path}${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data;
}

export async function getReporte(id: DelegacionReportId, filters?: ReportQueryFilters) {
  const { listPath } = getDelegacionReportDefinition(id);
  return fetchReportPage(listPath, filters);
}

export async function getAllReportesPreview(filters?: ReportQueryFilters) {
  const entries = await Promise.all(
    DELEGACION_REPORTS.map(async (report) => [
      report.id,
      await fetchReportPage(report.listPath, filters),
    ] as const),
  );

  return Object.fromEntries(entries) as Record<
    DelegacionReportId,
    ReportPageResponse<unknown> | undefined
  >;
}

export async function getReporteVacantes(filters?: ReportQueryFilters) {
  return getReporte("vacantes", filters);
}

export async function getReportePostulaciones(filters?: ReportQueryFilters) {
  return getReporte("postulaciones", filters);
}

export async function getReporteProcesos(filters?: ReportQueryFilters) {
  return getReporte("procesos", filters);
}

export async function getReporteLiberaciones(filters?: ReportQueryFilters) {
  return getReporte("liberaciones", filters);
}

export async function getReporteIncidencias(filters?: ReportQueryFilters) {
  return getReporte("incidencias", filters);
}

export async function getReporteHoras(filters?: ReportQueryFilters) {
  return getReporte("horas", filters);
}

export async function getReporteDocumentos(filters?: ReportQueryFilters) {
  return getReporte("documentos", filters);
}
