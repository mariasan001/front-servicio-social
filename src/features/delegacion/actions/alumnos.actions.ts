"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
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
  return runServerAction(
    () => getAlumnoCv(idAlumno),
    "No pudimos cargar el CV del alumno.",
  );
}

export async function normalizeAlumnoEscuelaAction(
  idAlumno: number,
  request: NormalizarEscuelaRequest,
): Promise<ActionResult<AlumnoPorNormalizarResponse>> {
  const result = await runServerAction(
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
  const result = await runServerAction(
    () => createEscuelaAndNormalizeAlumno(idAlumno, request),
    "No pudimos registrar la escuela y vincular al alumno.",
  );

  if (result.success) {
    revalidateDelegacionSection("alumnos");
  }

  return result;
}
