import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  CrearEvaluacionFinalRequest,
  CrearIncidenciaRequest,
  EmitirLiberacionTecnicaRequest,
  HoraResponse,
  IncidenciaResponse,
  ListProcesosFilters,
  ObservarHoraRequest,
  ProcesoDetalleResponse,
  ProcesoResponse,
  RechazarHoraRequest,
  RegistrarHoraInternaRequest,
  ValidarHoraRequest,
} from "../types/titular.types";

export async function listProcesos(filters?: ListProcesosFilters) {
  const response = await serverApiRequest<ProcesoResponse[]>(
    `/api/titular/procesos${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getProceso(idProceso: number) {
  const response = await serverApiRequest<ProcesoDetalleResponse>(
    `/api/titular/procesos/${idProceso}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle del proceso.");
  }

  return response.data;
}

export async function listProcesoHoras(idProceso: number) {
  const response = await serverApiRequest<HoraResponse[]>(
    `/api/titular/procesos/${idProceso}/horas`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function registerProcesoHora(
  idProceso: number,
  request: RegistrarHoraInternaRequest,
) {
  const response = await serverApiRequest<HoraResponse>(
    `/api/titular/procesos/${idProceso}/horas`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de registro de hora.");
  }

  return response.data;
}

export async function validateProcesoHora(
  idProceso: number,
  idAsistencia: number,
  request?: ValidarHoraRequest,
) {
  const response = await serverApiRequest<HoraResponse>(
    `/api/titular/procesos/${idProceso}/horas/${idAsistencia}/validar`,
    { method: "PATCH", body: request ?? {} },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de validación de hora.");
  }

  return response.data;
}

export async function rejectProcesoHora(
  idProceso: number,
  idAsistencia: number,
  request: RechazarHoraRequest,
) {
  const response = await serverApiRequest<HoraResponse>(
    `/api/titular/procesos/${idProceso}/horas/${idAsistencia}/rechazar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de rechazo de hora.");
  }

  return response.data;
}

export async function observeProcesoHora(
  idProceso: number,
  idAsistencia: number,
  request: ObservarHoraRequest,
) {
  const response = await serverApiRequest<HoraResponse>(
    `/api/titular/procesos/${idProceso}/horas/${idAsistencia}/observar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de observación de hora.");
  }

  return response.data;
}

export async function listProcesoIncidencias(idProceso: number) {
  const response = await serverApiRequest<IncidenciaResponse[]>(
    `/api/titular/procesos/${idProceso}/incidencias`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function registerProcesoIncidencia(
  idProceso: number,
  request: CrearIncidenciaRequest,
) {
  const response = await serverApiRequest<IncidenciaResponse>(
    `/api/titular/procesos/${idProceso}/incidencias`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de registro de incidencia.");
  }

  return response.data;
}

export async function getProcesoLiberacionTecnica(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/titular/procesos/${idProceso}/liberacion-tecnica`,
    { method: "GET" },
  );

  return response.data;
}

export async function emitProcesoLiberacionTecnica(
  idProceso: number,
  request?: EmitirLiberacionTecnicaRequest,
) {
  const response = await serverApiRequest<unknown>(
    `/api/titular/procesos/${idProceso}/liberacion-tecnica`,
    { method: "POST", body: request ?? {} },
  );

  return response.data;
}

export async function getProcesoEvaluacionFinal(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/titular/procesos/${idProceso}/evaluacion-final`,
    { method: "GET" },
  );

  return response.data;
}

export async function registerProcesoEvaluacionFinal(
  idProceso: number,
  request: CrearEvaluacionFinalRequest,
) {
  const response = await serverApiRequest<unknown>(
    `/api/titular/procesos/${idProceso}/evaluacion-final`,
    { method: "POST", body: request },
  );

  return response.data;
}
