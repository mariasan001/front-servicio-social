"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import type {
  ExamenDiagnosticoDetalleResponse,
  ResultadoExamenResponse,
} from "@/lib/domain";
import {
  getExamenMonitor,
  getResultadoExamenMonitor,
} from "../services/examenes.service";

export async function getExamenMonitorAction(
  idExamen: number,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  return runServerAction(
    () => getExamenMonitor(idExamen),
    "No pudimos cargar el examen.",
  );
}

export async function getResultadoExamenMonitorAction(
  idPostulacion: number,
): Promise<ActionResult<ResultadoExamenResponse>> {
  return runServerAction(
    () => getResultadoExamenMonitor(idPostulacion),
    "No pudimos cargar el resultado del examen.",
  );
}
