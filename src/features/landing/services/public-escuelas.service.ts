import { resolveBackendUrl } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { PublicEscuelaEstadisticasResponse } from "../types/public-escuela.types";

const LANDING_ESCUELAS_REVALIDATE_SECONDS = 120;

async function fetchPublicApi<T>(path: string): Promise<T | null> {
  const response = await fetch(resolveBackendUrl(path), {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: LANDING_ESCUELAS_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data ?? null;
}

export async function listPublicEscuelaEstadisticas() {
  const data = await fetchPublicApi<PublicEscuelaEstadisticasResponse[]>(
    "/api/public/escuelas/estadisticas",
  );

  return data ?? [];
}
