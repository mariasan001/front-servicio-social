import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  AceptarPostulacionRequest,
  ExamenFinalizadoRequest,
  ListPostulacionesFilters,
  PostulacionDetalleResponse,
  PostulacionResponse,
  RechazarPostulacionRequest,
} from "../types/titular.types";

export async function listPostulaciones(filters?: ListPostulacionesFilters) {
  const response = await serverApiRequest<PostulacionResponse[]>(
    `/api/titular/postulaciones${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getPostulacion(idPostulacion: number) {
  const response = await serverApiRequest<PostulacionDetalleResponse>(
    `/api/titular/postulaciones/${idPostulacion}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la postulación.");
  }

  return response.data;
}

export async function acceptPostulacion(
  idPostulacion: number,
  request?: AceptarPostulacionRequest,
) {
  const response = await serverApiRequest<PostulacionDetalleResponse>(
    `/api/titular/postulaciones/${idPostulacion}/aceptar`,
    { method: "PATCH", body: request ?? {} },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de aceptación.");
  }

  return response.data;
}

export async function rejectPostulacion(
  idPostulacion: number,
  request: RechazarPostulacionRequest,
) {
  const response = await serverApiRequest<PostulacionDetalleResponse>(
    `/api/titular/postulaciones/${idPostulacion}/rechazar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de rechazo.");
  }

  return response.data;
}

export async function markPostulacionExamFinished(
  idPostulacion: number,
  request: ExamenFinalizadoRequest,
) {
  const response = await serverApiRequest<PostulacionDetalleResponse>(
    `/api/titular/postulaciones/${idPostulacion}/examen-finalizado`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de examen finalizado.");
  }

  return response.data;
}
