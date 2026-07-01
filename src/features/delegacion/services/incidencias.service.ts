import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  IncidenciaResponse,
  ListIncidenciasFilters,
} from "../types/delegacion.types";

export async function listIncidencias(filters?: ListIncidenciasFilters) {
  const response = await serverApiRequest<IncidenciaResponse[]>(
    `/api/delegacion/incidencias${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getIncidencia(idIncidencia: number) {
  const response = await serverApiRequest<IncidenciaResponse>(
    `/api/delegacion/incidencias/${idIncidencia}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la incidencia.");
  }

  return response.data;
}

export async function resolveIncidencia(
  idIncidencia: number,
  request: { resoluciones: string[] },
) {
  const response = await serverApiRequest<IncidenciaResponse>(
    `/api/delegacion/incidencias/${idIncidencia}/resolver`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de resolución.");
  }

  return response.data;
}

export async function cancelIncidencia(
  idIncidencia: number,
  request: { motivoCancelacion: string },
) {
  const response = await serverApiRequest<IncidenciaResponse>(
    `/api/delegacion/incidencias/${idIncidencia}/cancelar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de cancelación.");
  }

  return response.data;
}
