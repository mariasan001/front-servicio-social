import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ListProcesosFilters,
  ProcesoResponse,
} from "../types/delegacion.types";

export async function listProcesos(filters?: ListProcesosFilters) {
  const response = await serverApiRequest<ProcesoResponse[]>(
    `/api/delegacion/procesos${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getProceso(idProceso: number) {
  const response = await serverApiRequest<ProcesoResponse>(
    `/api/delegacion/procesos/${idProceso}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle del proceso.");
  }

  return response.data;
}

export async function cancelProceso(
  idProceso: number,
  request: { motivoCancelacion: string },
) {
  const response = await serverApiRequest<ProcesoResponse>(
    `/api/delegacion/procesos/${idProceso}/cancelar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de cancelación.");
  }

  return response.data;
}

export async function listProcesoDocumentos(idProceso: number) {
  const response = await serverApiRequest<unknown[]>(
    `/api/delegacion/procesos/${idProceso}/documentos`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function listProcesoHoras(idProceso: number) {
  const response = await serverApiRequest<unknown[]>(
    `/api/delegacion/procesos/${idProceso}/horas`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function listProcesoIncidencias(idProceso: number) {
  const response = await serverApiRequest<unknown[]>(
    `/api/delegacion/procesos/${idProceso}/incidencias`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getProcesoLiberacionTecnica(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/delegacion/procesos/${idProceso}/liberacion-tecnica`,
    { method: "GET" },
  );

  return response.data;
}

export async function getProcesoEvaluacionFinal(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/delegacion/procesos/${idProceso}/evaluacion-final`,
    { method: "GET" },
  );

  return response.data;
}

export async function listProcesoCartas(idProceso: number) {
  const response = await serverApiRequest<unknown[]>(
    `/api/delegacion/procesos/${idProceso}/cartas`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function setProcesoHorasRequeridas(
  idProceso: number,
  request: { horasRequeridas: number },
) {
  const response = await serverApiRequest<ProcesoResponse>(
    `/api/delegacion/procesos/${idProceso}/horas-requeridas`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de horas requeridas.");
  }

  return response.data;
}
