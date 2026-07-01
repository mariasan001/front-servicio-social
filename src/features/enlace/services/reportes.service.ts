import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ReporteAlumnoResponse,
  ReporteAlumnosFilters,
} from "../types/enlace.types";

export async function getReporteAlumnos(filters?: ReporteAlumnosFilters) {
  const response = await serverApiRequest<ReporteAlumnoResponse[]>(
    `/api/enlace/reportes/alumnos${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}
