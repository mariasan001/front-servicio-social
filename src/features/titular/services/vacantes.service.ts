import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ActualizarVacanteRequest,
  CrearVacanteRequest,
  ListVacantesFilters,
  VacanteDetalleResponse,
  VacanteResponse,
} from "../types/titular.types";

export async function listVacantes(filters?: ListVacantesFilters) {
  const response = await serverApiRequest<VacanteResponse[]>(
    `/api/titular/vacantes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getVacante(idVacante: number) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/titular/vacantes/${idVacante}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la vacante.");
  }

  return response.data;
}

export async function createVacante(request: CrearVacanteRequest) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    "/api/titular/vacantes",
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de creación de vacante.");
  }

  return response.data;
}

export async function updateVacante(
  idVacante: number,
  request: ActualizarVacanteRequest,
) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/titular/vacantes/${idVacante}`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de actualización.");
  }

  return response.data;
}

export async function sendVacanteToReview(idVacante: number) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/titular/vacantes/${idVacante}/enviar-revision`,
    { method: "POST" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de envío a revisión.");
  }

  return response.data;
}

export async function cancelVacante(idVacante: number) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/titular/vacantes/${idVacante}/cancelar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de cancelación.");
  }

  return response.data;
}
