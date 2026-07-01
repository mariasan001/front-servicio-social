import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  IncidenciaDetalleResponse,
  IncidenciaResponse,
  ListIncidenciasFilters,
} from "../types/titular.types";

export async function listIncidencias(filters?: ListIncidenciasFilters) {
  const response = await serverApiRequest<IncidenciaResponse[]>(
    `/api/titular/incidencias${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getIncidencia(idIncidencia: number) {
  const response = await serverApiRequest<IncidenciaDetalleResponse>(
    `/api/titular/incidencias/${idIncidencia}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la incidencia.");
  }

  return response.data;
}
