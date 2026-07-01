import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ActualizarDependenciaRequest,
  CrearDependenciaRequest,
  DependenciaResponse,
  ListDependenciasFilters,
} from "../types/dependencia.types";

export async function listDependencias(filters?: ListDependenciasFilters) {
  const response = await serverApiRequest<DependenciaResponse[]>(
    `/api/dependencias${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getDependencia(idDependencia: number) {
  const response = await serverApiRequest<DependenciaResponse>(
    `/api/dependencias/${idDependencia}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la dependencia.");
  }

  return response.data;
}

export async function createDependencia(request: CrearDependenciaRequest) {
  const response = await serverApiRequest<DependenciaResponse>(
    "/api/dependencias",
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió la dependencia creada.");
  }

  return response.data;
}

export async function updateDependencia(
  idDependencia: number,
  request: ActualizarDependenciaRequest,
) {
  const response = await serverApiRequest<DependenciaResponse>(
    `/api/dependencias/${idDependencia}`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió la dependencia actualizada.");
  }

  return response.data;
}

export async function activateDependencia(idDependencia: number) {
  const response = await serverApiRequest<DependenciaResponse>(
    `/api/dependencias/${idDependencia}/activar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de activación.");
  }

  return response.data;
}

export async function deactivateDependencia(idDependencia: number) {
  const response = await serverApiRequest<DependenciaResponse>(
    `/api/dependencias/${idDependencia}/desactivar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de desactivación.");
  }

  return response.data;
}
