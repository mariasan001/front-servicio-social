"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { normalizeOptionalNumber } from "@/lib/actions/normalize-server-args";
import { resolveTitularAssignedAreaContext } from "../lib/area-context";
import { revalidateTitularSection } from "../lib/revalidate-titular";
import {
  activarExamen,
  addExamenPregunta,
  asociarExamenVacante,
  createExamen,
  deleteExamenPregunta,
  desactivarExamen,
  getExamen,
  getResultadoExamenPostulacion,
  getVacanteExamen,
  listExamenes,
  quitarExamenVacante,
  updateExamen,
  updateExamenPregunta,
} from "../services/examenes.service";
import type {
  ActualizarExamenDiagnosticoRequest,
  CrearExamenDiagnosticoRequest,
  ExamenDiagnosticoDetalleResponse,
  ExamenDiagnosticoResumenResponse,
  ExamenPreguntaRequest,
  ResultadoExamenResponse,
} from "../types/titular.types";

const AREA_RESOLUTION_ERROR =
  "No se pudo determinar el área asignada a tu cuenta. Contacta a administración para verificar tu asignación como titular.";

type CrearExamenActionRequest = Omit<CrearExamenDiagnosticoRequest, "areaId"> & {
  areaId?: number;
};

async function resolveAreaId(preferred?: number) {
  const normalized = normalizeOptionalNumber(preferred);
  if (normalized) {
    return normalized;
  }

  const context = await resolveTitularAssignedAreaContext();
  return context?.areaId;
}

export async function listExamenesAction(): Promise<
  ActionResult<ExamenDiagnosticoResumenResponse[]>
> {
  return runServerAction(
    () => listExamenes(),
    "No pudimos cargar los exámenes.",
  );
}

export async function getExamenDetailAction(
  idExamen: number,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  return runServerAction(
    () => getExamen(idExamen),
    "No pudimos cargar el examen.",
  );
}

export async function createExamenAction(
  request: CrearExamenActionRequest,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  const result = await runServerAction(async () => {
    const areaId = await resolveAreaId(request.areaId);

    if (!areaId) {
      throw new Error(AREA_RESOLUTION_ERROR);
    }

    return createExamen({ ...request, areaId });
  }, "No pudimos crear el examen.");

  if (result.success) {
    revalidateTitularSection("examenes");
  }

  return result;
}

export async function updateExamenAction(
  idExamen: number,
  request: ActualizarExamenDiagnosticoRequest,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  const result = await runServerAction(
    () => updateExamen(idExamen, request),
    "No pudimos actualizar el examen.",
  );

  if (result.success) {
    revalidateTitularSection("examenes");
  }

  return result;
}

export async function addExamenPreguntaAction(
  idExamen: number,
  request: ExamenPreguntaRequest,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  const result = await runServerAction(
    () => addExamenPregunta(idExamen, request),
    "No pudimos agregar la pregunta.",
  );

  if (result.success) {
    revalidateTitularSection("examenes");
  }

  return result;
}

export async function updateExamenPreguntaAction(
  idExamen: number,
  idPregunta: number,
  request: ExamenPreguntaRequest,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  const result = await runServerAction(
    () => updateExamenPregunta(idExamen, idPregunta, request),
    "No pudimos actualizar la pregunta.",
  );

  if (result.success) {
    revalidateTitularSection("examenes");
  }

  return result;
}

export async function deleteExamenPreguntaAction(
  idExamen: number,
  idPregunta: number,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  const result = await runServerAction(
    () => deleteExamenPregunta(idExamen, idPregunta),
    "No pudimos eliminar la pregunta.",
  );

  if (result.success) {
    revalidateTitularSection("examenes");
  }

  return result;
}

export async function activarExamenAction(
  idExamen: number,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  const result = await runServerAction(
    () => activarExamen(idExamen),
    "No pudimos activar el examen.",
  );

  if (result.success) {
    revalidateTitularSection("examenes");
  }

  return result;
}

export async function desactivarExamenAction(
  idExamen: number,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  const result = await runServerAction(
    () => desactivarExamen(idExamen),
    "No pudimos desactivar el examen.",
  );

  if (result.success) {
    revalidateTitularSection("examenes");
  }

  return result;
}

export async function getVacanteExamenAction(
  idVacante: number,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse | null>> {
  return runServerAction(
    () => getVacanteExamen(idVacante),
    "No pudimos consultar el examen de la vacante.",
  );
}

export async function asociarExamenVacanteAction(
  idVacante: number,
  idExamen: number,
): Promise<ActionResult<ExamenDiagnosticoDetalleResponse>> {
  const result = await runServerAction(
    () => asociarExamenVacante(idVacante, { idExamen }),
    "No pudimos asociar el examen a la vacante.",
  );

  if (result.success) {
    revalidateTitularSection("examenes");
    revalidateTitularSection("vacantes");
  }

  return result;
}

export async function quitarExamenVacanteAction(
  idVacante: number,
): Promise<ActionResult<void>> {
  const result = await runServerAction(
    () => quitarExamenVacante(idVacante),
    "No pudimos quitar el examen de la vacante.",
  );

  if (result.success) {
    revalidateTitularSection("examenes");
    revalidateTitularSection("vacantes");
  }

  return result;
}

export async function getResultadoExamenAction(
  idPostulacion: number,
): Promise<ActionResult<ResultadoExamenResponse>> {
  return runServerAction(
    () => getResultadoExamenPostulacion(idPostulacion),
    "No pudimos cargar el resultado del examen.",
  );
}
