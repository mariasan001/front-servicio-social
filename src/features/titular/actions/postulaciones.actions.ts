"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { revalidateTitularSection } from "../lib/revalidate-titular";
import {
  acceptPostulacion,
  getPostulacion,
  markPostulacionExamFinished,
  rejectPostulacion,
} from "../services/postulaciones.service";
import type {
  AceptarPostulacionRequest,
  ExamenFinalizadoRequest,
  PostulacionDetalleResponse,
  RechazarPostulacionRequest,
} from "../types/titular.types";

export async function getPostulacionDetailAction(
  idPostulacion: number,
): Promise<ActionResult<PostulacionDetalleResponse>> {
  return runAuthorizedAction([USER_ROLES.TITULAR_AREA], 
    () => getPostulacion(idPostulacion),
    "No pudimos cargar la información de la postulación.",
  );
}

export async function acceptPostulacionAction(
  idPostulacion: number,
  request?: AceptarPostulacionRequest,
): Promise<ActionResult<PostulacionDetalleResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => acceptPostulacion(idPostulacion, request),
    "No pudimos aceptar la postulación.",
  );

  if (result.success) {
    revalidateTitularSection("postulaciones");
    revalidateTitularSection("procesos");
    revalidateTitularSection("inicio");
  }

  return result;
}

export async function rejectPostulacionAction(
  idPostulacion: number,
  request: RechazarPostulacionRequest,
): Promise<ActionResult<PostulacionDetalleResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => rejectPostulacion(idPostulacion, request),
    "No pudimos rechazar la postulación.",
  );

  if (result.success) {
    revalidateTitularSection("postulaciones");
    revalidateTitularSection("inicio");
  }

  return result;
}

export async function markPostulacionExamFinishedAction(
  idPostulacion: number,
  request: ExamenFinalizadoRequest,
): Promise<ActionResult<PostulacionDetalleResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.TITULAR_AREA],
    () => markPostulacionExamFinished(idPostulacion, request),
    "No pudimos registrar el examen finalizado.",
  );

  if (result.success) {
    revalidateTitularSection("postulaciones");
    revalidateTitularSection("inicio");
  }

  return result;
}
