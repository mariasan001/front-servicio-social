import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ListPostulacionesFilters,
  PostulacionResponse,
} from "../types/delegacion.types";

export async function listPostulaciones(filters?: ListPostulacionesFilters) {
  const response = await serverApiRequest<PostulacionResponse[]>(
    `/api/delegacion/postulaciones${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getPostulacion(idPostulacion: number) {
  const response = await serverApiRequest<PostulacionResponse>(
    `/api/delegacion/postulaciones/${idPostulacion}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la postulación.");
  }

  return response.data;
}
