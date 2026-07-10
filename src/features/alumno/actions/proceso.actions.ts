"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import type { DownloadedFile } from "@/lib/api/download";
import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import type { CartaDownloadKind } from "@/lib/domain/cartas";
import { revalidateAlumnoSection } from "../lib/revalidate-alumno";
import {
  downloadCartaAceptacionArchivo,
  downloadCartaLiberacionArchivo,
  downloadDocumentoArchivoActual,
  registerEncuestaSatisfaccion,
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
  const result = await runAuthorizedAction([USER_ROLES.ALUMNO],
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
  const result = await runAuthorizedAction([USER_ROLES.ALUMNO],
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
  const result = await runAuthorizedAction([USER_ROLES.ALUMNO],
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
  return runAuthorizedAction([USER_ROLES.ALUMNO], 
    () => downloadDocumentoArchivoActual(idProceso, idProcesoDocumento),
    "No pudimos descargar el documento.",
  );
}

export async function downloadCartaArchivoAction(
  idProceso: number,
  kind: CartaDownloadKind,
): Promise<ActionResult<DownloadedFile>> {
  return runAuthorizedAction([USER_ROLES.ALUMNO], 
    () =>
      kind === "aceptacion"
        ? downloadCartaAceptacionArchivo(idProceso)
        : downloadCartaLiberacionArchivo(idProceso),
    "No pudimos descargar la carta.",
  );
}

export async function registerEncuestaSatisfaccionAction(
  request: {
    nombre: string;
    carrera: string;
    escuela: string;
    comentario: string;
  },
): Promise<ActionResult<{ idEncuesta: number }>> {
  return runAuthorizedAction(
    [USER_ROLES.ALUMNO],
    () => registerEncuestaSatisfaccion(request),
    "No pudimos enviar tu encuesta.",
  );
}
