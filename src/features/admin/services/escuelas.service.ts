import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ActualizarEscuelaRequest,
  CrearEscuelaRequest,
  EscuelaDetalleResponse,
  EscuelaResponse,
  EscuelaTokenResponse,
  GenerarTokenRequest,
  ListEscuelasFilters,
  TokenGeneradoResponse,
} from "../types/escuela.types";

export async function listEscuelas(filters?: ListEscuelasFilters) {
  const response = await serverApiRequest<EscuelaResponse[]>(
    `/api/escuelas${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getEscuela(idEscuela: number) {
  const response = await serverApiRequest<EscuelaDetalleResponse>(
    `/api/escuelas/${idEscuela}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la escuela.");
  }

  return response.data;
}

export async function createEscuela(request: CrearEscuelaRequest) {
  const response = await serverApiRequest<EscuelaDetalleResponse>(
    "/api/escuelas",
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió la escuela creada.");
  }

  return response.data;
}

export async function updateEscuela(
  idEscuela: number,
  request: ActualizarEscuelaRequest,
) {
  const response = await serverApiRequest<EscuelaDetalleResponse>(
    `/api/escuelas/${idEscuela}`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió la escuela actualizada.");
  }

  return response.data;
}

export async function listEscuelaTokens(idEscuela: number) {
  const response = await serverApiRequest<EscuelaTokenResponse[]>(
    `/api/escuelas/${idEscuela}/tokens`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function generateEscuelaToken(
  idEscuela: number,
  request: GenerarTokenRequest,
) {
  const response = await serverApiRequest<TokenGeneradoResponse>(
    `/api/escuelas/${idEscuela}/tokens`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió el token generado.");
  }

  return response.data;
}

export async function suspendEscuelaToken(idEscuela: number, idToken: number) {
  const response = await serverApiRequest<EscuelaTokenResponse>(
    `/api/escuelas/${idEscuela}/tokens/${idToken}/suspender`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de suspensión del token.");
  }

  return response.data;
}

export async function revokeEscuelaToken(idEscuela: number, idToken: number) {
  const response = await serverApiRequest<EscuelaTokenResponse>(
    `/api/escuelas/${idEscuela}/tokens/${idToken}/revocar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de revocación del token.");
  }

  return response.data;
}

export async function reactivateEscuelaToken(
  idEscuela: number,
  idToken: number,
) {
  const response = await serverApiRequest<EscuelaTokenResponse>(
    `/api/escuelas/${idEscuela}/tokens/${idToken}/reactivar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de reactivación del token.");
  }

  return response.data;
}
