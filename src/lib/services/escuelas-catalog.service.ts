import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type { EscuelaResponse } from "@/lib/domain/api-responses";

export type ListEscuelasCatalogFilters = {
  nombre?: string;
  estatus?: string;
  convenioEstatus?: string;
};

export async function listEscuelas(filters?: ListEscuelasCatalogFilters) {
  const response = await serverApiRequest<EscuelaResponse[]>(
    `/api/escuelas${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}
