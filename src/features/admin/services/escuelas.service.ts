import { serverApiRequest } from "@/lib/api/server-request";
import { listEscuelas as listEscuelasCatalog } from "@/lib/services/escuelas-catalog.service";
import type {
  ActualizarEscuelaRequest,
  CrearEscuelaRequest,
  EscuelaDetalleResponse,
  EscuelaTokenResponse,
  GenerarTokenRequest,
  ListEscuelasFilters,
  TokenGeneradoResponse,
  TokenReveladoResponse,
} from "../types/escuela.types";

export async function listEscuelas(filters?: ListEscuelasFilters) {
  return listEscuelasCatalog(filters);
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

export async function revealEscuelaToken(idEscuela: number, idToken: number) {
  const response = await serverApiRequest<TokenReveladoResponse>(
    `/api/escuelas/${idEscuela}/tokens/${idToken}/revelar`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el enlace de la invitación.");
  }

  return response.data;
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
