import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type { ReportPageResponse } from "@/lib/api/types";
import type {
  DashboardResponse,
  LiberacionPendienteCartaResponse,
  NotificacionCorreoResponse,
} from "../types/delegacion.types";

export async function getDashboard(filters?: {
  escuelaId?: number;
  areaId?: number;
  modalidadId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  const response = await serverApiRequest<DashboardResponse>(
    `/api/delegacion/reportes/dashboard${buildQuery(filters)}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el dashboard operativo.");
  }

  return response.data;
}

export async function listLiberacionesPendientesCarta() {
  const response = await serverApiRequest<LiberacionPendienteCartaResponse[]>(
    "/api/delegacion/liberaciones-tecnicas/pendientes-carta",
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function listNotificacionesCorreos(filters?: {
  estatus?: string;
  usuarioId?: number;
  correoDestino?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  size?: number;
}) {
  const response = await serverApiRequest<
    ReportPageResponse<NotificacionCorreoResponse>
  >(`/api/delegacion/notificaciones/correos${buildQuery(filters)}`, {
    method: "GET",
  });

  return response.data;
}
