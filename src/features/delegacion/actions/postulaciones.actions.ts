"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { getPostulacion } from "../services/postulaciones.service";
import type { PostulacionResponse } from "../types/delegacion.types";

export async function getPostulacionDetailAction(
  idPostulacion: number,
): Promise<ActionResult<PostulacionResponse>> {
  return runAuthorizedAction([USER_ROLES.DELEGACION], 
    () => getPostulacion(idPostulacion),
    "No pudimos cargar la información de la postulación.",
  );
}
