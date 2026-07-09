"use server";

import { USER_ROLES } from "@/lib/auth/constants";
import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import type { ExamenDiagnosticoDetalleResponse } from "@/lib/domain";
import { getExamenMonitor } from "@/lib/services/examenes-monitor.service";

export async function getExamenMonitorAction(
  idExamen: number,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  return runAuthorizedAction(
    [USER_ROLES.DELEGACION, USER_ROLES.ADMINISTRADOR],
    () => getExamenMonitor(idExamen),
    "No pudimos cargar el examen.",
  );
}
