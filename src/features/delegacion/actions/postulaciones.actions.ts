"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { getPostulacion } from "../services/postulaciones.service";
import type { PostulacionResponse } from "../types/delegacion.types";

export async function getPostulacionDetailAction(
  idPostulacion: number,
): Promise<ActionResult<PostulacionResponse>> {
  return runServerAction(
    () => getPostulacion(idPostulacion),
    "No pudimos cargar la información de la postulación.",
  );
}
