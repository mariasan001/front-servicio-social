import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type { ReportPageResponse } from "@/lib/api/types";
import type {
  ListNotificacionesFilters,
  NotificacionResponse,
} from "../types/alumno.types";

export async function listNotificaciones(filters?: ListNotificacionesFilters) {
  const response = await serverApiRequest<
    ReportPageResponse<NotificacionResponse>
  >(`/api/notificaciones${buildQuery(filters)}`, { method: "GET" });

  return response.data;
}

export async function markNotificacionRead(idNotificacion: number) {
  const response = await serverApiRequest<NotificacionResponse>(
    `/api/notificaciones/${idNotificacion}/leer`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de lectura.");
  }

  return response.data;
}

export async function markAllNotificacionesRead() {
  const response = await serverApiRequest<unknown>(
    "/api/notificaciones/leer-todas",
    { method: "PATCH" },
  );

  return response.data;
}
