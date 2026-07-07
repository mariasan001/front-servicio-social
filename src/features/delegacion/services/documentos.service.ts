import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import { normalizeDocumentoPendiente } from "../lib/normalize-pendientes";
import type {
  DocumentoPendienteResponse,
  ListDocumentosPendientesFilters,
} from "../types/delegacion.types";

export async function listDocumentosPendientes(
  filters?: ListDocumentosPendientesFilters,
) {
  const response = await serverApiRequest<unknown[]>(
    `/api/delegacion/documentos/pendientes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return (response.data ?? [])
    .map((row) => normalizeDocumentoPendiente(row))
    .filter((row): row is DocumentoPendienteResponse => row !== null);
}
