import {
  mapPublicListResult,
  PUBLIC_LOAD_ERRORS,
  type LandingFetchResult,
} from "./public-data";
import { listPublicEscuelaEstadisticas } from "../services/public-escuelas.service";
import type { PublicEscuelaEstadisticasResponse } from "../types/public-escuela.types";

export function sortPublicEscuelas(
  escuelas: PublicEscuelaEstadisticasResponse[],
) {
  return [...escuelas].sort((left, right) => {
    if (right.totalParticipantes !== left.totalParticipantes) {
      return right.totalParticipantes - left.totalParticipantes;
    }

    return left.nombreOficial.localeCompare(right.nombreOficial, "es-MX");
  });
}

export async function getLandingInstitutionStats(): Promise<
  LandingFetchResult<PublicEscuelaEstadisticasResponse[]>
> {
  const result = mapPublicListResult(
    await listPublicEscuelaEstadisticas(),
    PUBLIC_LOAD_ERRORS.escuelas,
  );

  if (result.loadError) {
    return result;
  }

  return { data: sortPublicEscuelas(result.data) };
}
