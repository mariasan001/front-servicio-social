"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { revalidateDelegacionSection } from "../lib/revalidate-delegacion";
import {
  cancelIncidencia,
  getIncidencia,
  resolveIncidencia,
} from "../services/incidencias.service";
import type {
  CancelarIncidenciaRequest,
  IncidenciaResponse,
  ResolverIncidenciaRequest,
} from "../types/delegacion.types";

export async function getIncidenciaDetailAction(
  idIncidencia: number,
): Promise<ActionResult<IncidenciaResponse>> {
  return runAuthorizedAction([USER_ROLES.DELEGACION], 
    () => getIncidencia(idIncidencia),
    "No pudimos cargar la información de la incidencia.",
  );
}

export async function resolveIncidenciaAction(
  idIncidencia: number,
  request: ResolverIncidenciaRequest,
): Promise<ActionResult<IncidenciaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.DELEGACION],
    () => resolveIncidencia(idIncidencia, request),
    "No pudimos resolver la incidencia.",
  );

  if (result.success) {
    revalidateDelegacionSection("incidencias");
    revalidateDelegacionSection("procesos");
  }

  return result;
}

export async function cancelIncidenciaAction(
  idIncidencia: number,
  request: CancelarIncidenciaRequest,
): Promise<ActionResult<IncidenciaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.DELEGACION],
    () => cancelIncidencia(idIncidencia, request),
    "No pudimos cancelar la incidencia.",
  );

  if (result.success) {
    revalidateDelegacionSection("incidencias");
    revalidateDelegacionSection("procesos");
  }

  return result;
}
