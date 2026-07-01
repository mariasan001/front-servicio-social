"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateAdminSection } from "../lib/revalidate-admin";
import {
  createEscuela,
  generateEscuelaToken,
  getEscuela,
  listEscuelaTokens,
  reactivateEscuelaToken,
  revokeEscuelaToken,
  suspendEscuelaToken,
  updateEscuela,
} from "../services/escuelas.service";
import type {
  ActualizarEscuelaRequest,
  CrearEscuelaRequest,
  EscuelaDetalleResponse,
  EscuelaTokenResponse,
  GenerarTokenRequest,
  TokenGeneradoResponse,
} from "../types/escuela.types";

export type EscuelaDetailPayload = {
  escuela: EscuelaDetalleResponse;
  invitaciones: EscuelaTokenResponse[];
};

export async function getEscuelaDetailAction(
  idEscuela: number,
): Promise<ActionResult<EscuelaDetailPayload>> {
  return runServerAction(async () => {
    const [escuela, invitaciones] = await Promise.all([
      getEscuela(idEscuela),
      listEscuelaTokens(idEscuela),
    ]);

    return { escuela, invitaciones };
  }, "No pudimos cargar la información de la escuela. Intenta de nuevo en unos momentos.");
}

export async function createEscuelaAction(
  request: CrearEscuelaRequest,
): Promise<ActionResult<EscuelaDetalleResponse>> {
  const result = await runServerAction(
    () => createEscuela(request),
    "No pudimos registrar la escuela. Revisa los datos e intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("escuelas");
  }

  return result;
}

export async function updateEscuelaAction(
  idEscuela: number,
  request: ActualizarEscuelaRequest,
): Promise<ActionResult<EscuelaDetalleResponse>> {
  const result = await runServerAction(
    () => updateEscuela(idEscuela, request),
    "No pudimos actualizar la escuela. Revisa los datos e intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("escuelas");
  }

  return result;
}

export async function generateEscuelaTokenAction(
  idEscuela: number,
  request: GenerarTokenRequest,
): Promise<ActionResult<TokenGeneradoResponse>> {
  const result = await runServerAction(
    () => generateEscuelaToken(idEscuela, request),
    "No pudimos generar la invitación de registro. Intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("escuelas");
  }

  return result;
}

export async function suspendEscuelaTokenAction(
  idEscuela: number,
  idToken: number,
): Promise<ActionResult<EscuelaTokenResponse>> {
  const result = await runServerAction(
    () => suspendEscuelaToken(idEscuela, idToken),
    "No pudimos suspender la invitación.",
  );

  if (result.success) {
    revalidateAdminSection("escuelas");
  }

  return result;
}

export async function revokeEscuelaTokenAction(
  idEscuela: number,
  idToken: number,
): Promise<ActionResult<EscuelaTokenResponse>> {
  const result = await runServerAction(
    () => revokeEscuelaToken(idEscuela, idToken),
    "No pudimos cancelar la invitación.",
  );

  if (result.success) {
    revalidateAdminSection("escuelas");
  }

  return result;
}

export async function reactivateEscuelaTokenAction(
  idEscuela: number,
  idToken: number,
): Promise<ActionResult<EscuelaTokenResponse>> {
  const result = await runServerAction(
    () => reactivateEscuelaToken(idEscuela, idToken),
    "No pudimos reactivar la invitación.",
  );

  if (result.success) {
    revalidateAdminSection("escuelas");
  }

  return result;
}
