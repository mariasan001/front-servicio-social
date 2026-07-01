"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
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
  return runServerAction(
    () => getIncidencia(idIncidencia),
    "No pudimos cargar la información de la incidencia.",
  );
}

export async function resolveIncidenciaAction(
  idIncidencia: number,
  request: ResolverIncidenciaRequest,
): Promise<ActionResult<IncidenciaResponse>> {
  const result = await runServerAction(
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
  const result = await runServerAction(
    () => cancelIncidencia(idIncidencia, request),
    "No pudimos cancelar la incidencia.",
  );

  if (result.success) {
    revalidateDelegacionSection("incidencias");
    revalidateDelegacionSection("procesos");
  }

  return result;
}
