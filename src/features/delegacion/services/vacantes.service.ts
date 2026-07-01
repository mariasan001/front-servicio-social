import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ListVacantesFilters,
  VacanteResponse,
} from "../types/delegacion.types";

export async function listVacantes(filters?: ListVacantesFilters) {
  const response = await serverApiRequest<VacanteResponse[]>(
    `/api/delegacion/vacantes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getVacante(idVacante: number) {
  const response = await serverApiRequest<VacanteResponse>(
    `/api/delegacion/vacantes/${idVacante}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la vacante.");
  }

  return response.data;
}

export async function publishVacante(idVacante: number) {
  const response = await serverApiRequest<VacanteResponse>(
    `/api/delegacion/vacantes/${idVacante}/publicar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de publicación.");
  }

  return response.data;
}

export async function closeVacante(idVacante: number) {
  const response = await serverApiRequest<VacanteResponse>(
    `/api/delegacion/vacantes/${idVacante}/cerrar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de cierre.");
  }

  return response.data;
}

export async function rejectVacante(
  idVacante: number,
  request: { motivoRechazo: string },
) {
  const response = await serverApiRequest<VacanteResponse>(
    `/api/delegacion/vacantes/${idVacante}/rechazar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de rechazo.");
  }

  return response.data;
}
