"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { revalidateDelegacionSection } from "../lib/revalidate-delegacion";
import {
  closeVacante,
  getVacante,
  publishVacante,
  rejectVacante,
} from "../services/vacantes.service";
import type {
  RechazarVacanteRequest,
  VacanteDetalleResponse,
  VacanteResponse,
} from "../types/delegacion.types";

export async function getVacanteDetailAction(
  idVacante: number,
): Promise<ActionResult<VacanteDetalleResponse>> {
  return runAuthorizedAction([USER_ROLES.DELEGACION], 
    () => getVacante(idVacante),
    "No pudimos cargar la información de la vacante.",
  );
}

export async function publishVacanteAction(
  idVacante: number,
): Promise<ActionResult<VacanteResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.DELEGACION],
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
  const result = await runAuthorizedAction([USER_ROLES.DELEGACION],
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
  const result = await runAuthorizedAction([USER_ROLES.DELEGACION],
    () => rejectVacante(idVacante, request),
    "No pudimos rechazar la vacante.",
  );

  if (result.success) {
    revalidateDelegacionSection("vacantes");
  }

  return result;
}
