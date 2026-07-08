import type { PublicApiResult } from "@/lib/api/public-request";

export type LandingFetchResult<T> = {
  data: T;
  loadError?: string;
};

export const PUBLIC_LOAD_ERRORS = {
  vacantes: "No pudimos cargar las vacantes.",
  escuelas: "No pudimos cargar las estadísticas de instituciones.",
  testimonios: "No pudimos cargar los testimonios.",
  vacanteDetalle: "No pudimos cargar el detalle de la vacante.",
} as const;

export function mapPublicListResult<T>(
  result: PublicApiResult<T[]>,
  errorMessage: string,
): LandingFetchResult<T[]> {
  if (!result.ok) {
    return { data: [], loadError: errorMessage };
  }

  return { data: result.data };
}
