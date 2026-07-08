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

export async function getLandingInstitutionStats() {
  const escuelas = await listPublicEscuelaEstadisticas();
  return sortPublicEscuelas(escuelas);
}
