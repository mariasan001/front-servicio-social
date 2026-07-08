import { publicApiGet } from "@/lib/api/public-request";
import type { PublicEscuelaEstadisticasResponse } from "../types/public-escuela.types";

export async function listPublicEscuelaEstadisticas() {
  return publicApiGet<PublicEscuelaEstadisticasResponse[]>(
    "/api/public/escuelas/estadisticas",
  );
}
