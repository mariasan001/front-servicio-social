"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateAlumnoSection } from "../lib/revalidate-alumno";
import {
  cancelPostulacion,
  createPostulacion,
  getPostulacion,
} from "../services/postulaciones.service";
import type {
  CrearPostulacionRequest,
  PostulacionDetalleResponse,
} from "../types/alumno.types";

export async function getPostulacionDetailAction(
  idPostulacion: number,
): Promise<ActionResult<PostulacionDetalleResponse>> {
  return runServerAction(
    () => getPostulacion(idPostulacion),
    "No pudimos cargar la información de la postulación.",
  );
}

export async function createPostulacionAction(
  request: CrearPostulacionRequest,
): Promise<ActionResult<PostulacionDetalleResponse>> {
  const result = await runServerAction(
    () => createPostulacion(request),
    "No pudimos registrar tu postulación.",
  );

  if (result.success) {
    revalidateAlumnoSection("postulaciones");
    revalidateAlumnoSection("vacantes");
    revalidateAlumnoSection("inicio");
  }

  return result;
}

export async function cancelPostulacionAction(
  idPostulacion: number,
): Promise<ActionResult<PostulacionDetalleResponse>> {
  const result = await runServerAction(
    () => cancelPostulacion(idPostulacion),
    "No pudimos cancelar la postulación.",
  );

  if (result.success) {
    revalidateAlumnoSection("postulaciones");
    revalidateAlumnoSection("inicio");
  }

  return result;
}
