"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { getVacante } from "../services/vacantes.service";
import type { VacanteDetalleResponse } from "../types/alumno.types";

export async function getVacanteDetailAction(
  idVacante: number,
): Promise<ActionResult<VacanteDetalleResponse>> {
  return runServerAction(
    () => getVacante(idVacante),
    "No pudimos cargar la información de la vacante.",
  );
}
