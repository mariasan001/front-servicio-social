"use server";

import type { DownloadedFile } from "@/lib/api/download";
import { runServerAction, type ActionResult } from "@/lib/actions";
import type { CartaDownloadKind } from "@/lib/domain/cartas";
import { revalidateAlumnoSection } from "../lib/revalidate-alumno";
import {
  downloadCartaAceptacionArchivo,
  downloadCartaLiberacionArchivo,
  downloadDocumentoArchivoActual,
  registerProcesoHora,
  updateProcesoHoraBitacora,
  uploadDocumentoArchivo,
} from "../services/proceso.service";
import type {
  ActualizarBitacoraRequest,
  HoraResponse,
  RegistrarHoraRequest,
} from "../types/alumno.types";

export async function registerProcesoHoraAction(
  idProceso: number,
  request: RegistrarHoraRequest,
): Promise<ActionResult<HoraResponse>> {
  const result = await runServerAction(
    () => registerProcesoHora(idProceso, request),
    "No pudimos registrar las horas.",
  );

  if (result.success) {
    revalidateAlumnoSection("proceso");
    revalidateAlumnoSection("inicio");
  }

  return result;
}

export async function updateProcesoHoraBitacoraAction(
  idProceso: number,
  idAsistencia: number,
  request: ActualizarBitacoraRequest,
): Promise<ActionResult<HoraResponse>> {
  const result = await runServerAction(
    () => updateProcesoHoraBitacora(idProceso, idAsistencia, request),
    "No pudimos actualizar la bitácora.",
  );

  if (result.success) {
    revalidateAlumnoSection("proceso");
  }

  return result;
}

export async function uploadDocumentoArchivoAction(
  idProceso: number,
  idProcesoDocumento: number,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const result = await runServerAction(
    () => uploadDocumentoArchivo(idProceso, idProcesoDocumento, formData),
    "No pudimos subir el archivo.",
  );

  if (result.success) {
    revalidateAlumnoSection("proceso");
  }

  return result;
}

export async function downloadDocumentoArchivoAction(
  idProceso: number,
  idProcesoDocumento: number,
): Promise<ActionResult<DownloadedFile>> {
  return runServerAction(
    () => downloadDocumentoArchivoActual(idProceso, idProcesoDocumento),
    "No pudimos descargar el documento.",
  );
}

export async function downloadCartaArchivoAction(
  idProceso: number,
  kind: CartaDownloadKind,
): Promise<ActionResult<DownloadedFile>> {
  return runServerAction(
    () =>
      kind === "aceptacion"
        ? downloadCartaAceptacionArchivo(idProceso)
        : downloadCartaLiberacionArchivo(idProceso),
    "No pudimos descargar la carta.",
  );
}
