import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  DocumentoPendienteResponse,
  ListDocumentosPendientesFilters,
} from "../types/delegacion.types";

export async function listDocumentosPendientes(
  filters?: ListDocumentosPendientesFilters,
) {
  const response = await serverApiRequest<DocumentoPendienteResponse[]>(
    `/api/delegacion/documentos/pendientes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}
