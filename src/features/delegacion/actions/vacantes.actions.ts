"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateDelegacionSection } from "../lib/revalidate-delegacion";
import {
  closeVacante,
  getVacante,
  publishVacante,
  rejectVacante,
} from "../services/vacantes.service";
import type {
  RechazarVacanteRequest,
  VacanteResponse,
} from "../types/delegacion.types";

export async function getVacanteDetailAction(
  idVacante: number,
): Promise<ActionResult<VacanteResponse>> {
  return runServerAction(
    () => getVacante(idVacante),
    "No pudimos cargar la información de la vacante.",
  );
}

export async function publishVacanteAction(
  idVacante: number,
): Promise<ActionResult<VacanteResponse>> {
  const result = await runServerAction(
    () => publishVacante(idVacante),
    "No pudimos publicar la vacante.",
  );

  if (result.success) {
    revalidateDelegacionSection("vacantes");
  }

  return result;
}

export async function closeVacanteAction(
  idVacante: number,
): Promise<ActionResult<VacanteResponse>> {
  const result = await runServerAction(
    () => closeVacante(idVacante),
    "No pudimos cerrar la vacante.",
  );

  if (result.success) {
    revalidateDelegacionSection("vacantes");
  }

  return result;
}

export async function rejectVacanteAction(
  idVacante: number,
  request: RechazarVacanteRequest,
): Promise<ActionResult<VacanteResponse>> {
  const result = await runServerAction(
    () => rejectVacante(idVacante, request),
    "No pudimos rechazar la vacante.",
  );

  if (result.success) {
    revalidateDelegacionSection("vacantes");
  }

  return result;
}
