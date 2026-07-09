"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { revalidateTitularSection } from "../lib/revalidate-titular";
import {
  emitProcesoLiberacionTecnica,
  getProceso,
  getProcesoEvaluacionFinal,
  getProcesoLiberacionTecnica,
  listProcesoHoras,
  listProcesoIncidencias,
  observeProcesoHora,
  registerProcesoEvaluacionFinal,
  registerProcesoHora,
  registerProcesoIncidencia,
  rejectProcesoHora,
  validateProcesoHora,
} from "../services/procesos.service";
import type {
  CrearEvaluacionFinalRequest,
  CrearIncidenciaRequest,
  EmitirLiberacionTecnicaRequest,
  HoraResponse,
  IncidenciaResponse,
  ObservarHoraRequest,
  ProcesoDetalleResponse,
  RechazarHoraRequest,
  RegistrarHoraInternaRequest,
  ValidarHoraRequest,
} from "../types/titular.types";

export type TitularProcesoDetailPayload = {
  proceso: ProcesoDetalleResponse;
  horas: HoraResponse[];
  incidencias: IncidenciaResponse[];
  liberacionTecnica: unknown;
  evaluacionFinal: unknown;
};

export async function getProcesoDetailAction(
  idProceso: number,
): Promise<ActionResult<TitularProcesoDetailPayload>> {
  return runAuthorizedAction([USER_ROLES.TITULAR_AREA], async () => {
    const [proceso, horas, incidencias, liberacionTecnica, evaluacionFinal] =
      await Promise.all([
        getProceso(idProceso),
        listProcesoHoras(idProceso),
        listProcesoIncidencias(idProceso),
        getProcesoLiberacionTecnica(idProceso).catch(() => null),
        getProcesoEvaluacionFinal(idProceso).catch(() => null),
      ]);

    return { proceso, horas, incidencias, liberacionTecnica, evaluacionFinal };
  }, "No pudimos cargar la información del proceso.");
}

export async function validateProcesoHoraAction(
  idProceso: number,
  idAsistencia: number,
  request?: ValidarHoraRequest,
): Promise<ActionResult<HoraResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => validateProcesoHora(idProceso, idAsistencia, request),
    "No pudimos validar el registro de horas.",
  );

  if (result.success) {
    revalidateTitularSection("procesos");
  }

  return result;
}

export async function observeProcesoHoraAction(
  idProceso: number,
  idAsistencia: number,
  request: ObservarHoraRequest,
): Promise<ActionResult<HoraResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => observeProcesoHora(idProceso, idAsistencia, request),
    "No pudimos observar el registro de horas.",
  );

  if (result.success) {
    revalidateTitularSection("procesos");
  }

  return result;
}

export async function rejectProcesoHoraAction(
  idProceso: number,
  idAsistencia: number,
  request: RechazarHoraRequest,
): Promise<ActionResult<HoraResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => rejectProcesoHora(idProceso, idAsistencia, request),
    "No pudimos rechazar el registro de horas.",
  );

  if (result.success) {
    revalidateTitularSection("procesos");
  }

  return result;
}

export async function registerProcesoHoraAction(
  idProceso: number,
  request: RegistrarHoraInternaRequest,
): Promise<ActionResult<HoraResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => registerProcesoHora(idProceso, request),
    "No pudimos registrar las horas.",
  );

  if (result.success) {
    revalidateTitularSection("procesos");
  }

  return result;
}

export async function registerProcesoIncidenciaAction(
  idProceso: number,
  request: CrearIncidenciaRequest,
): Promise<ActionResult<IncidenciaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => registerProcesoIncidencia(idProceso, request),
    "No pudimos registrar la incidencia.",
  );

  if (result.success) {
    revalidateTitularSection("procesos");
  }

  return result;
}

export async function emitProcesoLiberacionTecnicaAction(
  idProceso: number,
  request?: EmitirLiberacionTecnicaRequest,
): Promise<ActionResult<unknown>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => emitProcesoLiberacionTecnica(idProceso, request),
    "No pudimos emitir la liberación técnica.",
  );

  if (result.success) {
    revalidateTitularSection("procesos");
  }

  return result;
}

export async function registerProcesoEvaluacionFinalAction(
  idProceso: number,
  request: CrearEvaluacionFinalRequest,
): Promise<ActionResult<unknown>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => registerProcesoEvaluacionFinal(idProceso, request),
    "No pudimos registrar la evaluación final.",
  );

  if (!result.success && result.error.includes("HORAS_COMPLETAS")) {
    return {
      success: false,
      error:
        "El servidor aún no registró el estatus «Horas completas» para este proceso. Pide a delegación que valide de nuevo las horas o que revise el caso con soporte.",
    };
  }

  if (result.success) {
    revalidateTitularSection("procesos");
  }

  return result;
}
