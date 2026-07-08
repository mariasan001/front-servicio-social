"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import type { ExamenDiagnosticoDetalleResponse } from "@/lib/domain";
import { getExamenMonitor } from "../services/examenes.service";

export async function getExamenMonitorAction(
  idExamen: number,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  return runServerAction(
    () => getExamenMonitor(idExamen),
    "No pudimos cargar el examen.",
  );
}
