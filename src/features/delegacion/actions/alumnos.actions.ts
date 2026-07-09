"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { revalidateDelegacionSection } from "../lib/revalidate-delegacion";
import {
  createEscuelaAndNormalizeAlumno,
  getAlumnoCv,
  normalizeAlumnoEscuela,
} from "../services/alumnos.service";
import type {
  AlumnoCvResponse,
  AlumnoPorNormalizarResponse,
  CrearEscuelaYNormalizarRequest,
  NormalizarEscuelaRequest,
} from "../types/delegacion.types";

export async function getAlumnoCvAction(
  idAlumno: number,
): Promise<ActionResult<AlumnoCvResponse>> {
  return runAuthorizedAction([USER_ROLES.DELEGACION], 
    () => getAlumnoCv(idAlumno),
    "No pudimos cargar el CV del alumno.",
  );
}

export async function normalizeAlumnoEscuelaAction(
  idAlumno: number,
  request: NormalizarEscuelaRequest,
): Promise<ActionResult<AlumnoPorNormalizarResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.DELEGACION],
    () => normalizeAlumnoEscuela(idAlumno, request),
    "No pudimos vincular la escuela del alumno.",
  );

  if (result.success) {
    revalidateDelegacionSection("alumnos");
  }

  return result;
}

export async function createEscuelaAndNormalizeAlumnoAction(
  idAlumno: number,
  request: CrearEscuelaYNormalizarRequest,
): Promise<ActionResult<AlumnoPorNormalizarResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.DELEGACION],
    () => createEscuelaAndNormalizeAlumno(idAlumno, request),
    "No pudimos registrar la escuela y vincular al alumno.",
  );

  if (result.success) {
    revalidateDelegacionSection("alumnos");
  }

  return result;
}
