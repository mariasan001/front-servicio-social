"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { getIncidencia } from "../services/incidencias.service";
import type { IncidenciaDetalleResponse } from "../types/titular.types";

export async function getIncidenciaDetailAction(
  idIncidencia: number,
): Promise<ActionResult<IncidenciaDetalleResponse>> {
  return runServerAction(
    () => getIncidencia(idIncidencia),
    "No pudimos cargar la información de la incidencia.",
  );
}
