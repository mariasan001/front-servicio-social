"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateAlumnoSection } from "../lib/revalidate-alumno";
import {
  getProcesoHorasResumen,
  listProcesoCartas,
  listProcesoDocumentos,
  listProcesoHoras,
  listProcesoIncidencias,
  registerProcesoHora,
  updateProcesoHoraBitacora,
  uploadDocumentoArchivo,
} from "../services/proceso.service";
import type {
  ActualizarBitacoraRequest,
  CartaMetadataResponse,
  DocumentoEstatusResponse,
  HoraResponse,
  HorasResumenResponse,
  IncidenciaResponse,
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

export type AlumnoProcesoDetailPayload = {
  horasResumen: HorasResumenResponse | null;
  horas: HoraResponse[];
  documentos: DocumentoEstatusResponse[];
  cartas: CartaMetadataResponse[];
  incidencias: IncidenciaResponse[];
};

export async function getAlumnoProcesoDetailAction(
  idProceso: number,
): Promise<ActionResult<AlumnoProcesoDetailPayload>> {
  return runServerAction(async () => {
    const [horasResumen, horas, documentos, cartas, incidencias] = await Promise.all([
      getProcesoHorasResumen(idProceso).catch(() => null),
      listProcesoHoras(idProceso),
      listProcesoDocumentos(idProceso),
      listProcesoCartas(idProceso),
      listProcesoIncidencias(idProceso),
    ]);

    return { horasResumen, horas, documentos, cartas, incidencias };
  }, "No pudimos cargar el detalle del proceso.");
}
