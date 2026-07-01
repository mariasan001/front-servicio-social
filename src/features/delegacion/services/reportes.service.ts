import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type { ReportPageResponse } from "@/lib/api/types";
import type { ReportQueryFilters } from "../types/delegacion.types";

export async function getReporteVacantes(filters?: ReportQueryFilters) {
  const response = await serverApiRequest<ReportPageResponse<unknown>>(
    `/api/delegacion/reportes/vacantes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data;
}

export async function getReportePostulaciones(filters?: ReportQueryFilters) {
  const response = await serverApiRequest<ReportPageResponse<unknown>>(
    `/api/delegacion/reportes/postulaciones${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data;
}

export async function getReporteProcesos(filters?: ReportQueryFilters) {
  const response = await serverApiRequest<ReportPageResponse<unknown>>(
    `/api/delegacion/reportes/procesos${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data;
}

export async function getReporteLiberaciones(filters?: ReportQueryFilters) {
  const response = await serverApiRequest<ReportPageResponse<unknown>>(
    `/api/delegacion/reportes/liberaciones${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data;
}

export async function getReporteIncidencias(filters?: ReportQueryFilters) {
  const response = await serverApiRequest<ReportPageResponse<unknown>>(
    `/api/delegacion/reportes/incidencias${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data;
}

export async function getReporteHoras(filters?: ReportQueryFilters) {
  const response = await serverApiRequest<ReportPageResponse<unknown>>(
    `/api/delegacion/reportes/horas${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data;
}

export async function getReporteDocumentos(filters?: ReportQueryFilters) {
  const response = await serverApiRequest<ReportPageResponse<unknown>>(
    `/api/delegacion/reportes/documentos${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data;
}

export async function exportReporteVacantes(filters?: ReportQueryFilters) {
  return serverApiRequest<unknown>(
    `/api/delegacion/reportes/vacantes/export${buildQuery(filters)}`,
    { method: "GET" },
  );
}

export async function exportReportePostulaciones(filters?: ReportQueryFilters) {
  return serverApiRequest<unknown>(
    `/api/delegacion/reportes/postulaciones/export${buildQuery(filters)}`,
    { method: "GET" },
  );
}

export async function exportReporteProcesos(filters?: ReportQueryFilters) {
  return serverApiRequest<unknown>(
    `/api/delegacion/reportes/procesos/export${buildQuery(filters)}`,
    { method: "GET" },
  );
}

export async function exportReporteLiberaciones(filters?: ReportQueryFilters) {
  return serverApiRequest<unknown>(
    `/api/delegacion/reportes/liberaciones/export${buildQuery(filters)}`,
    { method: "GET" },
  );
}

export async function exportReporteIncidencias(filters?: ReportQueryFilters) {
  return serverApiRequest<unknown>(
    `/api/delegacion/reportes/incidencias/export${buildQuery(filters)}`,
    { method: "GET" },
  );
}

export async function exportReporteHoras(filters?: ReportQueryFilters) {
  return serverApiRequest<unknown>(
    `/api/delegacion/reportes/horas/export${buildQuery(filters)}`,
    { method: "GET" },
  );
}

export async function exportReporteDocumentos(filters?: ReportQueryFilters) {
  return serverApiRequest<unknown>(
    `/api/delegacion/reportes/documentos/export${buildQuery(filters)}`,
    { method: "GET" },
  );
}
