"use server";

import type { DownloadedFile } from "@/lib/api/download";
import { runServerAction, type ActionResult } from "@/lib/actions";
import type { CartaDownloadKind } from "@/lib/domain/cartas";
import { revalidateDelegacionSection } from "../lib/revalidate-delegacion";
import { revalidateTitularSection } from "@/features/titular/lib/revalidate-titular";
import {
  approveProcesoDocumento,
  cancelProceso,
  cancelProcesoHora,
  downloadProcesoCartaAceptacionArchivo,
  downloadProcesoCartaLiberacionArchivo,
  downloadProcesoDocumentoArchivo,
  emitProcesoCartaAceptacion,
  emitProcesoCartaAceptacionConArchivo,
  emitProcesoCartaLiberacion,
  emitProcesoCartaLiberacionConArchivo,
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
  CartaMetadataResponse,
  CrearIncidenciaProcesoRequest,
  IncidenciaResponse,
  ObservarHoraRequest,
  ProcesoDocumentoResponse,
  ProcesoHoraResponse,
  ProcesoResponse,
  HoraPendienteDetail,
  RechazarHoraRequest,
  ValidarDocumentoRequest,
  ValidarHoraRequest,
} from "../types/delegacion.types";

export type ProcesoDetailPayload = {
  proceso: ProcesoResponse;
  documentos: ProcesoDocumentoResponse[];
  horas: ProcesoHoraResponse[];
  incidencias: IncidenciaResponse[];
  cartas: CartaMetadataResponse[];
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
    "No pudimos guardar las horas requeridas.",
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

export async function getHoraPendienteDetailAction(
  idProceso: number,
  idAsistencia: number,
): Promise<ActionResult<HoraPendienteDetail>> {
  return runServerAction(async () => {
    let horas: Awaited<ReturnType<typeof listProcesoHoras>> = [];

    try {
      horas = await listProcesoHoras(idProceso);
    } catch {
      throw new Error("DETALLE_HORA_NO_DISPONIBLE");
    }

    const hora = horas.find((item) => item.idAsistencia === idAsistencia);

    if (!hora) {
      throw new Error("DETALLE_HORA_NO_DISPONIBLE");
    }

    return {
      idProceso,
      idAsistencia: hora.idAsistencia,
      estatus: hora.estatus,
      fecha: hora.fecha,
      horasRegistradas: hora.horasRegistradas,
      horaEntrada: hora.horaEntrada,
      horaSalida: hora.horaSalida,
      descripcionActividades: hora.descripcionActividades,
    };
  }, "No pudimos cargar el detalle del registro de horas.");
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
    revalidateTitularSection("procesos");
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

export async function downloadProcesoDocumentoArchivoAction(
  idProceso: number,
  idProcesoDocumento: number,
): Promise<ActionResult<DownloadedFile>> {
  return runServerAction(
    () => downloadProcesoDocumentoArchivo(idProceso, idProcesoDocumento),
    "No pudimos descargar el documento.",
  );
}

export async function downloadProcesoCartaArchivoAction(
  idProceso: number,
  kind: CartaDownloadKind,
): Promise<ActionResult<DownloadedFile>> {
  return runServerAction(
    () =>
      kind === "aceptacion"
        ? downloadProcesoCartaAceptacionArchivo(idProceso)
        : downloadProcesoCartaLiberacionArchivo(idProceso),
    "No pudimos descargar la carta.",
  );
}

export async function emitProcesoCartaAction(
  idProceso: number,
  kind: CartaDownloadKind,
): Promise<ActionResult<CartaMetadataResponse>> {
  const result = await runServerAction(
    () =>
      kind === "aceptacion"
        ? emitProcesoCartaAceptacion(idProceso)
        : emitProcesoCartaLiberacion(idProceso),
    "No pudimos emitir la carta.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("inicio");
  }

  return result;
}

export async function emitProcesoCartaConArchivoAction(
  idProceso: number,
  kind: CartaDownloadKind,
  formData: FormData,
): Promise<ActionResult<CartaMetadataResponse>> {
  const result = await runServerAction(
    () =>
      kind === "aceptacion"
        ? emitProcesoCartaAceptacionConArchivo(idProceso, formData)
        : emitProcesoCartaLiberacionConArchivo(idProceso, formData),
    "No pudimos emitir la carta con archivo.",
  );

  if (result.success) {
    revalidateDelegacionSection("procesos");
    revalidateDelegacionSection("inicio");
  }

  return result;
}
