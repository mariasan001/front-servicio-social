"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { getIncidencia } from "../services/incidencias.service";
import type { IncidenciaDetalleResponse } from "../types/titular.types";

export async function getIncidenciaDetailAction(
  idIncidencia: number,
): Promise<ActionResult<IncidenciaDetalleResponse>> {
  return runAuthorizedAction([USER_ROLES.TITULAR_AREA], 
    () => getIncidencia(idIncidencia),
    "No pudimos cargar la información de la incidencia.",
  );
}
