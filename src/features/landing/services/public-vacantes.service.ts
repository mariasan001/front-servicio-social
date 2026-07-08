import { resolveBackendUrl } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  PublicVacanteDetalleResponse,
  PublicVacanteResponse,
} from "../types/public-vacante.types";

const LANDING_VACANCIES_REVALIDATE_SECONDS = 120;

async function fetchPublicApi<T>(path: string): Promise<T | null> {
  const response = await fetch(resolveBackendUrl(path), {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: LANDING_VACANCIES_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data ?? null;
}

export async function listPublicVacantes(filters?: {
  modalidadId?: string;
  areaId?: number;
  nombre?: string;
}) {
  const params = new URLSearchParams();

  if (filters?.modalidadId?.trim()) {
    params.set("modalidadId", filters.modalidadId.trim());
  }

  if (filters?.areaId) {
    params.set("areaId", String(filters.areaId));
  }

  if (filters?.nombre?.trim()) {
    params.set("nombre", filters.nombre.trim());
  }

  const query = params.toString();
  const path = `/api/public/vacantes${query ? `?${query}` : ""}`;
  const data = await fetchPublicApi<PublicVacanteResponse[]>(path);

  return data ?? [];
}

export async function getPublicVacanteDetail(idVacante: number) {
  return fetchPublicApi<PublicVacanteDetalleResponse>(
    `/api/public/vacantes/${idVacante}`,
  );
}
