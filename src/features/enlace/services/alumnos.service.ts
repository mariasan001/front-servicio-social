import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  AlumnoDetalleResponse,
  AlumnoResponse,
  ListAlumnosFilters,
} from "../types/enlace.types";

export async function listAlumnos(filters?: ListAlumnosFilters) {
  const response = await serverApiRequest<AlumnoResponse[]>(
    `/api/enlace/alumnos${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getAlumno(idAlumno: number) {
  const response = await serverApiRequest<AlumnoDetalleResponse>(
    `/api/enlace/alumnos/${idAlumno}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle del alumno.");
  }

  return response.data;
}
