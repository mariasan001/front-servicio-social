"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { actionFailure, runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { puedePostularVacantes } from "@/lib/domain";
import { isCvComplete } from "../components/cv/cv-labels";
import { revalidateAlumnoSection } from "../lib/revalidate-alumno";
import { getCv } from "../services/cv.service";
import { getProcesoActual } from "../services/inicio.service";
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
  return runAuthorizedAction([USER_ROLES.ALUMNO], 
    () => getPostulacion(idPostulacion),
    "No pudimos cargar la información de la postulación.",
  );
}

export async function createPostulacionAction(
  request: CrearPostulacionRequest,
): Promise<ActionResult<PostulacionDetalleResponse>> {
  const procesoActual = await getProcesoActual().catch(() => null);

  if (!puedePostularVacantes(procesoActual)) {
    return actionFailure(
      "Ya tienes un proceso de servicio social en curso. No puedes postularte a nuevas vacantes mientras esté vigente.",
      { code: "ALUMNO_CON_PROCESO_VIGENTE" },
    );
  }

  const cv = await getCv().catch(() => null);
  if (!isCvComplete(cv)) {
    return actionFailure(
      "Completa y guarda tu CV antes de postularte.",
      { code: "CV_INCOMPLETO" },
    );
  }

  const result = await runAuthorizedAction([USER_ROLES.ALUMNO],
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
  const result = await runAuthorizedAction([USER_ROLES.ALUMNO],
    () => cancelPostulacion(idPostulacion),
    "No pudimos cancelar la postulación.",
  );

  if (result.success) {
    revalidateAlumnoSection("postulaciones");
    revalidateAlumnoSection("inicio");
  }

  return result;
}
