"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { getAlumno } from "../services/alumnos.service";
import type { AlumnoDetalleResponse } from "../types/enlace.types";

export async function getAlumnoDetailAction(
  idAlumno: number,
): Promise<ActionResult<AlumnoDetalleResponse>> {
  return runAuthorizedAction([USER_ROLES.ENLACE_ESCOLAR], 
    () => getAlumno(idAlumno),
    "No pudimos cargar la información del alumno.",
  );
}
