"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import type {
  AlumnoExamenDisponibleResponse,
  FinalizarExamenRequest,
  FinalizarExamenResponse,
  IntentoExamenResponse,
} from "@/lib/domain";
import { revalidateAlumnoSection } from "../lib/revalidate-alumno";
import {
  finalizarExamenPostulacion,
  getExamenPostulacion,
  iniciarExamenPostulacion,
} from "../services/examen.service";

export async function getExamenPostulacionAction(
  idPostulacion: number,
): Promise<ActionResult<AlumnoExamenDisponibleResponse>> {
  return runAuthorizedAction([USER_ROLES.ALUMNO], 
    () => getExamenPostulacion(idPostulacion),
    "No pudimos cargar el examen.",
  );
}

export async function iniciarExamenPostulacionAction(
  idPostulacion: number,
): Promise<ActionResult<IntentoExamenResponse>> {
  return runAuthorizedAction([USER_ROLES.ALUMNO], 
    () => iniciarExamenPostulacion(idPostulacion),
    "No pudimos iniciar el examen.",
  );
}

export async function finalizarExamenPostulacionAction(
  idPostulacion: number,
  request: FinalizarExamenRequest,
): Promise<ActionResult<FinalizarExamenResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ALUMNO],
    () => finalizarExamenPostulacion(idPostulacion, request),
    "No pudimos enviar tus respuestas.",
  );

  if (result.success) {
    revalidateAlumnoSection("postulaciones");
    revalidateAlumnoSection("inicio");
  }

  return result;
}
