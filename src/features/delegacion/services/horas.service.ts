import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  HoraPendienteResponse,
  ListHorasPendientesFilters,
} from "../types/delegacion.types";

export async function listHorasPendientes(filters?: ListHorasPendientesFilters) {
  const response = await serverApiRequest<HoraPendienteResponse[]>(
    `/api/delegacion/horas/pendientes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}
