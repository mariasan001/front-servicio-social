"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
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
  return runServerAction(
    () => getExamenPostulacion(idPostulacion),
    "No pudimos cargar el examen.",
  );
}

export async function iniciarExamenPostulacionAction(
  idPostulacion: number,
): Promise<ActionResult<IntentoExamenResponse>> {
  return runServerAction(
    () => iniciarExamenPostulacion(idPostulacion),
    "No pudimos iniciar el examen.",
  );
}

export async function finalizarExamenPostulacionAction(
  idPostulacion: number,
  request: FinalizarExamenRequest,
): Promise<ActionResult<FinalizarExamenResponse>> {
  const result = await runServerAction(
    () => finalizarExamenPostulacion(idPostulacion, request),
    "No pudimos enviar tus respuestas.",
  );

  if (result.success) {
    revalidateAlumnoSection("postulaciones");
    revalidateAlumnoSection("inicio");
  }

  return result;
}
