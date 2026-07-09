"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { revalidateAdminSection } from "../lib/revalidate-admin";
import {
  createEscuela,
  generateEscuelaToken,
  getEscuela,
  listEscuelaTokens,
  reactivateEscuelaToken,
  revealEscuelaToken,
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
  TokenReveladoResponse,
} from "../types/escuela.types";

export type EscuelaDetailPayload = {
  escuela: EscuelaDetalleResponse;
  invitaciones: EscuelaTokenResponse[];
};

export async function getEscuelaDetailAction(
  idEscuela: number,
): Promise<ActionResult<EscuelaDetailPayload>> {
  return runAuthorizedAction([USER_ROLES.ADMINISTRADOR], async () => {
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
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
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
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
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
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => generateEscuelaToken(idEscuela, request),
    "No pudimos generar la invitación de registro. Intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("escuelas");
  }

  return result;
}

export async function revealEscuelaTokenAction(
  idEscuela: number,
  idToken: number,
): Promise<ActionResult<TokenReveladoResponse>> {
  return runAuthorizedAction([USER_ROLES.ADMINISTRADOR], 
    () => revealEscuelaToken(idEscuela, idToken),
    "No pudimos recuperar el enlace de la invitación.",
  );
}

export async function suspendEscuelaTokenAction(
  idEscuela: number,
  idToken: number,
): Promise<ActionResult<EscuelaTokenResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
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
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
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
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => reactivateEscuelaToken(idEscuela, idToken),
    "No pudimos reactivar la invitación.",
  );

  if (result.success) {
    revalidateAdminSection("escuelas");
  }

  return result;
}
