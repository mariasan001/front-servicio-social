"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateTitularSection } from "../lib/revalidate-titular";
import {
  cancelVacante,
  createVacante,
  getVacante,
  sendVacanteToReview,
  updateVacante,
} from "../services/vacantes.service";
import type {
  ActualizarVacanteRequest,
  CrearVacanteRequest,
  VacanteDetalleResponse,
} from "../types/titular.types";

export async function getVacanteDetailAction(
  idVacante: number,
): Promise<ActionResult<VacanteDetalleResponse>> {
  return runServerAction(
    () => getVacante(idVacante),
    "No pudimos cargar la información de la vacante.",
  );
}

export async function createVacanteAction(
  request: CrearVacanteRequest,
): Promise<ActionResult<VacanteDetalleResponse>> {
  const result = await runServerAction(
    () => createVacante(request),
    "No pudimos registrar la vacante.",
  );

  if (result.success) {
    revalidateTitularSection("vacantes");
    revalidateTitularSection("inicio");
  }

  return result;
}

export async function updateVacanteAction(
  idVacante: number,
  request: ActualizarVacanteRequest,
): Promise<ActionResult<VacanteDetalleResponse>> {
  const result = await runServerAction(
    () => updateVacante(idVacante, request),
    "No pudimos actualizar la vacante.",
  );

  if (result.success) {
    revalidateTitularSection("vacantes");
  }

  return result;
}

export async function sendVacanteToReviewAction(
  idVacante: number,
): Promise<ActionResult<VacanteDetalleResponse>> {
  const result = await runServerAction(
    () => sendVacanteToReview(idVacante),
    "No pudimos enviar la vacante a revisión.",
  );

  if (result.success) {
    revalidateTitularSection("vacantes");
    revalidateTitularSection("inicio");
  }

  return result;
}

export async function cancelVacanteAction(
  idVacante: number,
): Promise<ActionResult<VacanteDetalleResponse>> {
  const result = await runServerAction(
    () => cancelVacante(idVacante),
    "No pudimos cancelar la vacante.",
  );

  if (result.success) {
    revalidateTitularSection("vacantes");
    revalidateTitularSection("inicio");
  }

  return result;
}
