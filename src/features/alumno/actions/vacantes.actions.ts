"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { getVacante } from "../services/vacantes.service";
import type { VacanteDetalleResponse } from "../types/alumno.types";

export async function getVacanteDetailAction(
  idVacante: number,
): Promise<ActionResult<VacanteDetalleResponse>> {
  return runAuthorizedAction([USER_ROLES.ALUMNO], 
    () => getVacante(idVacante),
    "No pudimos cargar la información de la vacante.",
  );
}
