"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { getAlumno } from "../services/alumnos.service";
import type { AlumnoDetalleResponse } from "../types/enlace.types";

export async function getAlumnoDetailAction(
  idAlumno: number,
): Promise<ActionResult<AlumnoDetalleResponse>> {
  return runServerAction(
    () => getAlumno(idAlumno),
    "No pudimos cargar la información del alumno.",
  );
}
