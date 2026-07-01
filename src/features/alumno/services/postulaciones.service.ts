import { serverApiRequest } from "@/lib/api/server-request";
import type {
  CrearPostulacionRequest,
  PostulacionDetalleResponse,
  PostulacionResponse,
} from "../types/alumno.types";

export async function listPostulaciones() {
  const response = await serverApiRequest<PostulacionResponse[]>(
    "/api/alumno/postulaciones",
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getPostulacion(idPostulacion: number) {
  const response = await serverApiRequest<PostulacionDetalleResponse>(
    `/api/alumno/postulaciones/${idPostulacion}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la postulación.");
  }

  return response.data;
}

export async function createPostulacion(request: CrearPostulacionRequest) {
  const response = await serverApiRequest<PostulacionDetalleResponse>(
    "/api/alumno/postulaciones",
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de postulación.");
  }

  return response.data;
}

export async function cancelPostulacion(idPostulacion: number) {
  const response = await serverApiRequest<PostulacionDetalleResponse>(
    `/api/alumno/postulaciones/${idPostulacion}/cancelar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de cancelación.");
  }

  return response.data;
}
