import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type { ReportPageResponse } from "@/lib/api/types";
import type {
  EncuestaSatisfaccionResponse,
  ListEncuestasSatisfaccionFilters,
} from "../types/delegacion.types";

export async function listEncuestasSatisfaccion(
  filters?: ListEncuestasSatisfaccionFilters,
) {
  const response = await serverApiRequest<ReportPageResponse<EncuestaSatisfaccionResponse>>(
    `/api/delegacion/encuestas-satisfaccion${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data?.content ?? [];
}

export async function ocultarEncuestaSatisfaccion(idEncuesta: number) {
  const response = await serverApiRequest<EncuestaSatisfaccionResponse>(
    `/api/delegacion/encuestas-satisfaccion/${idEncuesta}/ocultar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación al ocultar la encuesta.");
  }

  return response.data;
}

export async function publicarEncuestaSatisfaccion(idEncuesta: number) {
  const response = await serverApiRequest<EncuestaSatisfaccionResponse>(
    `/api/delegacion/encuestas-satisfaccion/${idEncuesta}/publicar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación al publicar la encuesta.");
  }

  return response.data;
}
