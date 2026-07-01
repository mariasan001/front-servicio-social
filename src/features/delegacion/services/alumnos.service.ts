import { serverApiRequest } from "@/lib/api/server-request";
import type {
  AlumnoCvResponse,
  AlumnoPorNormalizarResponse,
  CrearEscuelaYNormalizarRequest,
  NormalizarEscuelaRequest,
} from "../types/delegacion.types";

export async function listAlumnosPorNormalizar() {
  const response = await serverApiRequest<AlumnoPorNormalizarResponse[]>(
    "/api/delegacion/alumnos/escuela-por-normalizar",
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getAlumnoCv(idAlumno: number) {
  const response = await serverApiRequest<AlumnoCvResponse>(
    `/api/delegacion/alumnos/${idAlumno}/cv`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el CV del alumno.");
  }

  return response.data;
}

export async function normalizeAlumnoEscuela(
  idAlumno: number,
  request: NormalizarEscuelaRequest,
) {
  const response = await serverApiRequest<AlumnoPorNormalizarResponse>(
    `/api/delegacion/alumnos/${idAlumno}/normalizar-escuela`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de normalización.");
  }

  return response.data;
}

export async function createEscuelaAndNormalizeAlumno(
  idAlumno: number,
  request: CrearEscuelaYNormalizarRequest,
) {
  const response = await serverApiRequest<AlumnoPorNormalizarResponse>(
    `/api/delegacion/alumnos/${idAlumno}/crear-escuela-y-normalizar`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de creación y normalización.");
  }

  return response.data;
}
