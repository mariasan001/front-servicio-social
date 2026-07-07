import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  AreaCatalogResponse,
  TitularAreaCatalogResponse,
} from "@/lib/domain/api-responses";

export type ListAreasCatalogFilters = {
  dependenciaId?: number;
  nombre?: string;
  activa?: boolean;
};

export async function listAreas(filters?: ListAreasCatalogFilters) {
  const response = await serverApiRequest<AreaCatalogResponse[]>(
    `/api/areas${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function listAreaTitulares(idArea: number) {
  const response = await serverApiRequest<TitularAreaCatalogResponse[]>(
    `/api/areas/${idArea}/titulares`,
    { method: "GET" },
  );

  return response.data ?? [];
}
