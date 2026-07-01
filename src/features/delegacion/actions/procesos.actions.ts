"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateDelegacionSection } from "../lib/revalidate-delegacion";
import {
  approveProcesoDocumento,
  cancelProceso,
  cancelProcesoHora,
  getProceso,
  listProcesoCartas,
  listProcesoDocumentos,
  listProcesoHoras,
  listProcesoIncidencias,
  observeProcesoDocumento,
  observeProcesoHora,
  registerProcesoIncidencia,
  rejectProcesoDocumento,
  rejectProcesoHora,
  setProcesoHorasRequeridas,
  validateProcesoHora,
} from "../services/procesos.service";
import type {
  CancelarHoraRequest,
  CancelarProcesoRequest,
  CrearIncidenciaProcesoRequest,
  IncidenciaResponse,
  ObservarHoraRequest,
  ProcesoDocumentoResponse,
  ProcesoHoraResponse,
  ProcesoResponse,
  RechazarHoraRequest,
  ValidarDocumentoRequest,
  ValidarHoraRequest,
} from "../types/delegacion.types";

export type ProcesoDetailPayload = {
  proceso: ProcesoResponse;
  documentos: ProcesoDocumentoResponse[];
  horas: ProcesoHoraResponse[];
  incidencias: IncidenciaResponse[];
  cartas: unknown[];
};

export async function getProcesoDetailAction(
  idProceso: number,
): Promise<ActionResult<ProcesoDetailPayload>> {
  return runServerAction(async () => {
    const [proceso, documentos, horas, incidencias, cartas] = await Promise.all([
      getProceso(idProceso),
      listProcesoDocumentos(idProceso),
      listProcesoHoras(idProceso),
      listProcesoIncidencias(idProceso),
      listProcesoCartas(idProceso),
    ]);

    return { proceso, documentos, horas, incidencias, cartas };
  }, "No pudimos cargar la información del proceso.");
}

export async function cancelProcesoAction(
  idProceso: number,
  request: CancelarProcesoRequest,
): Promise<ActionResult<ProcesoResponse>> {
  const result = await runServerAction(
    () => cancelProceso(idProceso, request),
    "No pudimos cancelar el proceso.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("inicio");
  }

  return result;
}

export async function setProcesoHorasRequeridasAction(
  idProceso: number,
  horasRequeridas: number,
): Promise<ActionResult<ProcesoResponse>> {
  const result = await runServerAction(
    () => setProcesoHorasRequeridas(idProceso, { horasRequeridas }),
    "No pudimos actualizar las horas requeridas.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
  }

  return result;
}

export async function approveProcesoDocumentoAction(
  idProceso: number,
  idProcesoDocumento: number,
): Promise<ActionResult<ProcesoDocumentoResponse>> {
  const result = await runServerAction(
    () => approveProcesoDocumento(idProceso, idProcesoDocumento),
    "No pudimos aprobar el documento.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("documentos");
  }

  return result;
}

export async function observeProcesoDocumentoAction(
  idProceso: number,
  idProcesoDocumento: number,
  request: ValidarDocumentoRequest,
): Promise<ActionResult<ProcesoDocumentoResponse>> {
  const result = await runServerAction(
    () => observeProcesoDocumento(idProceso, idProcesoDocumento, request),
    "No pudimos registrar la observación del documento.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("documentos");
  }

  return result;
}

export async function rejectProcesoDocumentoAction(
  idProceso: number,
  idProcesoDocumento: number,
  request: ValidarDocumentoRequest,
): Promise<ActionResult<ProcesoDocumentoResponse>> {
  const result = await runServerAction(
    () => rejectProcesoDocumento(idProceso, idProcesoDocumento, request),
    "No pudimos rechazar el documento.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("documentos");
  }

  return result;
}

export async function validateProcesoHoraAction(
  idProceso: number,
  idAsistencia: number,
  request?: ValidarHoraRequest,
): Promise<ActionResult<ProcesoHoraResponse>> {
  const result = await runServerAction(
    () => validateProcesoHora(idProceso, idAsistencia, request),
    "No pudimos validar el registro de horas.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("horas");
  }

  return result;
}

export async function rejectProcesoHoraAction(
  idProceso: number,
  idAsistencia: number,
  request: RechazarHoraRequest,
): Promise<ActionResult<ProcesoHoraResponse>> {
  const result = await runServerAction(
    () => rejectProcesoHora(idProceso, idAsistencia, request),
    "No pudimos rechazar el registro de horas.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("horas");
  }

  return result;
}

export async function observeProcesoHoraAction(
  idProceso: number,
  idAsistencia: number,
  request: ObservarHoraRequest,
): Promise<ActionResult<ProcesoHoraResponse>> {
  const result = await runServerAction(
    () => observeProcesoHora(idProceso, idAsistencia, request),
    "No pudimos registrar la observación de horas.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("horas");
  }

  return result;
}

export async function cancelProcesoHoraAction(
  idProceso: number,
  idAsistencia: number,
  request: CancelarHoraRequest,
): Promise<ActionResult<ProcesoHoraResponse>> {
  const result = await runServerAction(
    () => cancelProcesoHora(idProceso, idAsistencia, request),
    "No pudimos cancelar el registro de horas.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("horas");
  }

  return result;
}

export async function registerProcesoIncidenciaAction(
  idProceso: number,
  request: CrearIncidenciaProcesoRequest,
): Promise<ActionResult<IncidenciaResponse>> {
  const result = await runServerAction(
    () => registerProcesoIncidencia(idProceso, request),
    "No pudimos registrar la incidencia.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("incidencias");
  }

  return result;
}
