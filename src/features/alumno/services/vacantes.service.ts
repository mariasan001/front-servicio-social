import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ListVacantesFilters,
  VacanteDetalleResponse,
  VacanteResponse,
} from "../types/alumno.types";

export async function listVacantes(filters?: ListVacantesFilters) {
  const response = await serverApiRequest<VacanteResponse[]>(
    `/api/alumno/vacantes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getVacante(idVacante: number) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/alumno/vacantes/${idVacante}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la vacante.");
  }

  return response.data;
}
