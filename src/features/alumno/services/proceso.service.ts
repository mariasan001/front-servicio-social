import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ActualizarBitacoraRequest,
  CartaMetadataResponse,
  DocumentoEstatusResponse,
  HoraResponse,
  HorasResumenResponse,
  IncidenciaResponse,
  ProcesoDetalleResponse,
  ProcesoResponse,
  RegistrarHoraRequest,
} from "../types/alumno.types";

export async function listProcesos() {
  const response = await serverApiRequest<ProcesoResponse[]>(
    "/api/alumno/procesos",
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getProceso(idProceso: number) {
  const response = await serverApiRequest<ProcesoDetalleResponse>(
    `/api/alumno/procesos/${idProceso}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle del proceso.");
  }

  return response.data;
}

export async function listProcesoHoras(idProceso: number) {
  const response = await serverApiRequest<HoraResponse[]>(
    `/api/alumno/procesos/${idProceso}/horas`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getProcesoHorasResumen(idProceso: number) {
  const response = await serverApiRequest<HorasResumenResponse>(
    `/api/alumno/procesos/${idProceso}/horas/resumen`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el resumen de horas.");
  }

  return response.data;
}

export async function registerProcesoHora(
  idProceso: number,
  request: RegistrarHoraRequest,
) {
  const response = await serverApiRequest<HoraResponse>(
    `/api/alumno/procesos/${idProceso}/horas`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de registro de hora.");
  }

  return response.data;
}

export async function updateProcesoHoraBitacora(
  idProceso: number,
  idAsistencia: number,
  request: ActualizarBitacoraRequest,
) {
  const response = await serverApiRequest<HoraResponse>(
    `/api/alumno/procesos/${idProceso}/horas/${idAsistencia}/bitacora`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de actualización de bitácora.");
  }

  return response.data;
}

export async function listProcesoDocumentos(idProceso: number) {
  const response = await serverApiRequest<DocumentoEstatusResponse[]>(
    `/api/alumno/procesos/${idProceso}/documentos`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function uploadDocumentoArchivo(
  idProceso: number,
  idProcesoDocumento: number,
  body: FormData,
) {
  const response = await serverApiRequest<unknown>(
    `/api/alumno/procesos/${idProceso}/documentos/${idProcesoDocumento}/archivo`,
    { method: "POST", body },
  );

  return response.data;
}

export async function downloadDocumentoArchivoActual(
  idProceso: number,
  idProcesoDocumento: number,
) {
  const response = await serverApiRequest<unknown>(
    `/api/alumno/procesos/${idProceso}/documentos/${idProcesoDocumento}/archivo-actual`,
    { method: "GET" },
  );

  return response.data;
}

export async function listProcesoCartas(idProceso: number) {
  const response = await serverApiRequest<CartaMetadataResponse[]>(
    `/api/alumno/procesos/${idProceso}/cartas`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getCartaAceptacion(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/alumno/procesos/${idProceso}/carta-aceptacion`,
    { method: "GET" },
  );

  return response.data;
}

export async function getCartaAceptacionArchivo(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/alumno/procesos/${idProceso}/carta-aceptacion/archivo`,
    { method: "GET" },
  );

  return response.data;
}

export async function getCartaLiberacion(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/alumno/procesos/${idProceso}/carta-liberacion`,
    { method: "GET" },
  );

  return response.data;
}

export async function getCartaLiberacionArchivo(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/alumno/procesos/${idProceso}/carta-liberacion/archivo`,
    { method: "GET" },
  );

  return response.data;
}

export async function listProcesoIncidencias(idProceso: number) {
  const response = await serverApiRequest<IncidenciaResponse[]>(
    `/api/alumno/procesos/${idProceso}/incidencias`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getProcesoLiberacionTecnica(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/alumno/procesos/${idProceso}/liberacion-tecnica`,
    { method: "GET" },
  );

  return response.data;
}

export async function getProcesoEvaluacionFinal(idProceso: number) {
  const response = await serverApiRequest<unknown>(
    `/api/alumno/procesos/${idProceso}/evaluacion-final`,
    { method: "GET" },
  );

  return response.data;
}
