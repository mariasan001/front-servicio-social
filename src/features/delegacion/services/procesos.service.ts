import { buildQuery } from "@/lib/api/query";
import { serverDownloadRequest } from "@/lib/api/download";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  CancelarHoraRequest,
  CancelarProcesoRequest,
  CartaMetadataResponse,
  CrearIncidenciaProcesoRequest,
  ListProcesosFilters,
  ObservarHoraRequest,
  ProcesoDocumentoResponse,
  ProcesoHoraResponse,
  ProcesoResponse,
  RechazarHoraRequest,
  RegistrarHoraInternaRequest,
  ValidarDocumentoRequest,
  ValidarHoraRequest,
} from "../types/delegacion.types";
import type { IncidenciaResponse } from "../types/delegacion.types";

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
  request: CancelarProcesoRequest,
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
  const response = await serverApiRequest<ProcesoDocumentoResponse[]>(
    `/api/delegacion/procesos/${idProceso}/documentos`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function approveProcesoDocumento(
  idProceso: number,
  idProcesoDocumento: number,
) {
  const response = await serverApiRequest<ProcesoDocumentoResponse>(
    `/api/delegacion/procesos/${idProceso}/documentos/${idProcesoDocumento}/aprobar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de aprobación del documento.");
  }

  return response.data;
}

export async function observeProcesoDocumento(
  idProceso: number,
  idProcesoDocumento: number,
  request: ValidarDocumentoRequest,
) {
  const response = await serverApiRequest<ProcesoDocumentoResponse>(
    `/api/delegacion/procesos/${idProceso}/documentos/${idProcesoDocumento}/observar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de observación del documento.");
  }

  return response.data;
}

export async function rejectProcesoDocumento(
  idProceso: number,
  idProcesoDocumento: number,
  request: ValidarDocumentoRequest,
) {
  const response = await serverApiRequest<ProcesoDocumentoResponse>(
    `/api/delegacion/procesos/${idProceso}/documentos/${idProcesoDocumento}/rechazar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de rechazo del documento.");
  }

  return response.data;
}

export async function listProcesoHoras(idProceso: number) {
  const response = await serverApiRequest<ProcesoHoraResponse[]>(
    `/api/delegacion/procesos/${idProceso}/horas`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function registerProcesoHora(
  idProceso: number,
  request: RegistrarHoraInternaRequest,
) {
  const response = await serverApiRequest<ProcesoHoraResponse>(
    `/api/delegacion/procesos/${idProceso}/horas`,
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
  const response = await serverApiRequest<ProcesoHoraResponse>(
    `/api/delegacion/procesos/${idProceso}/horas/${idAsistencia}/validar`,
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
  const response = await serverApiRequest<ProcesoHoraResponse>(
    `/api/delegacion/procesos/${idProceso}/horas/${idAsistencia}/rechazar`,
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
  const response = await serverApiRequest<ProcesoHoraResponse>(
    `/api/delegacion/procesos/${idProceso}/horas/${idAsistencia}/observar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de observación de hora.");
  }

  return response.data;
}

export async function cancelProcesoHora(
  idProceso: number,
  idAsistencia: number,
  request: CancelarHoraRequest,
) {
  const response = await serverApiRequest<ProcesoHoraResponse>(
    `/api/delegacion/procesos/${idProceso}/horas/${idAsistencia}/cancelar`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de cancelación de hora.");
  }

  return response.data;
}

export async function listProcesoIncidencias(idProceso: number) {
  const response = await serverApiRequest<IncidenciaResponse[]>(
    `/api/delegacion/procesos/${idProceso}/incidencias`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function registerProcesoIncidencia(
  idProceso: number,
  request: CrearIncidenciaProcesoRequest,
) {
  const response = await serverApiRequest<IncidenciaResponse>(
    `/api/delegacion/procesos/${idProceso}/incidencias`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de registro de incidencia.");
  }

  return response.data;
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
  const response = await serverApiRequest<CartaMetadataResponse[]>(
    `/api/delegacion/procesos/${idProceso}/cartas`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function downloadProcesoDocumentoArchivo(
  idProceso: number,
  idProcesoDocumento: number,
) {
  return serverDownloadRequest(
    `/api/delegacion/procesos/${idProceso}/documentos/${idProcesoDocumento}/archivo-actual`,
    `documento-${idProcesoDocumento}`,
  );
}

export async function emitProcesoCartaAceptacion(idProceso: number) {
  const response = await serverApiRequest<CartaMetadataResponse>(
    `/api/delegacion/procesos/${idProceso}/carta-aceptacion/emitir`,
    { method: "POST" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de emisión de carta de aceptación.");
  }

  return response.data;
}

export async function emitProcesoCartaAceptacionConArchivo(
  idProceso: number,
  body: FormData,
) {
  const response = await serverApiRequest<CartaMetadataResponse>(
    `/api/delegacion/procesos/${idProceso}/carta-aceptacion/emitir-con-archivo`,
    { method: "POST", body },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de emisión de carta de aceptación.");
  }

  return response.data;
}

export async function downloadProcesoCartaAceptacionArchivo(idProceso: number) {
  return serverDownloadRequest(
    `/api/delegacion/procesos/${idProceso}/carta-aceptacion/archivo`,
    `carta-aceptacion-${idProceso}.pdf`,
  );
}

export async function emitProcesoCartaLiberacion(idProceso: number) {
  const response = await serverApiRequest<CartaMetadataResponse>(
    `/api/delegacion/procesos/${idProceso}/carta-liberacion/emitir`,
    { method: "POST" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de emisión de carta de liberación.");
  }

  return response.data;
}

export async function emitProcesoCartaLiberacionConArchivo(
  idProceso: number,
  body: FormData,
) {
  const response = await serverApiRequest<CartaMetadataResponse>(
    `/api/delegacion/procesos/${idProceso}/carta-liberacion/emitir-con-archivo`,
    { method: "POST", body },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de emisión de carta de liberación.");
  }

  return response.data;
}

export async function downloadProcesoCartaLiberacionArchivo(idProceso: number) {
  return serverDownloadRequest(
    `/api/delegacion/procesos/${idProceso}/carta-liberacion/archivo`,
    `carta-liberacion-${idProceso}.pdf`,
  );
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
