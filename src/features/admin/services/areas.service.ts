import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ActualizarAreaRequest,
  AreaDetalleResponse,
  AreaResponse,
  CrearAreaRequest,
  ListAreasFilters,
} from "../types/area.types";
import type {
  AsignarTitularAreaRequest,
  TitularAreaResponse,
} from "../types/titular.types";

export async function listAreas(filters?: ListAreasFilters) {
  const response = await serverApiRequest<AreaResponse[]>(
    `/api/areas${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getArea(idArea: number) {
  const response = await serverApiRequest<AreaDetalleResponse>(
    `/api/areas/${idArea}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle del área.");
  }

  return response.data;
}

export async function createArea(request: CrearAreaRequest) {
  const response = await serverApiRequest<AreaResponse>("/api/areas", {
    method: "POST",
    body: request,
  });

  if (!response.data) {
    throw new Error("No se recibió el área creada.");
  }

  return response.data;
}

export async function updateArea(idArea: number, request: ActualizarAreaRequest) {
  const response = await serverApiRequest<AreaResponse>(
    `/api/areas/${idArea}`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió el área actualizada.");
  }

  return response.data;
}

export async function activateArea(idArea: number) {
  const response = await serverApiRequest<AreaResponse>(
    `/api/areas/${idArea}/activar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de activación.");
  }

  return response.data;
}

export async function deactivateArea(idArea: number) {
  const response = await serverApiRequest<AreaResponse>(
    `/api/areas/${idArea}/desactivar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de desactivación.");
  }

  return response.data;
}

export async function listAreaTitulares(idArea: number) {
  const response = await serverApiRequest<TitularAreaResponse[]>(
    `/api/areas/${idArea}/titulares`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function assignAreaTitular(
  idArea: number,
  request: AsignarTitularAreaRequest,
) {
  const response = await serverApiRequest<TitularAreaResponse>(
    `/api/areas/${idArea}/titulares`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió la asignación del titular.");
  }

  return response.data;
}

export async function setPrincipalAreaTitular(
  idArea: number,
  idAsignacion: number,
) {
  const response = await serverApiRequest<TitularAreaResponse>(
    `/api/areas/${idArea}/titulares/${idAsignacion}/principal`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación del titular principal.");
  }

  return response.data;
}

export async function deactivateAreaTitular(
  idArea: number,
  idAsignacion: number,
) {
  const response = await serverApiRequest<TitularAreaResponse>(
    `/api/areas/${idArea}/titulares/${idAsignacion}/desactivar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de desactivación del titular.");
  }

  return response.data;
}
