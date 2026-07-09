"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { normalizeOptionalNumber, normalizeOptionalString } from "@/lib/actions/normalize-server-args";
import { requireServerSession } from "@/lib/auth/session.server";
import { resolveTitularAreaContext } from "../lib/area-context";
import { revalidateTitularSection } from "../lib/revalidate-titular";
import {
  cancelVacante,
  createVacante,
  getVacante,
  listVacantes,
  sendVacanteToReview,
  updateVacante,
} from "../services/vacantes.service";
import type {
  ActualizarVacanteRequest,
  CrearVacanteRequest,
  VacanteDetalleResponse,
} from "../types/titular.types";

type CrearVacanteActionRequest = Omit<CrearVacanteRequest, "areaId" | "modalidadId"> & {
  areaId?: number;
  modalidadId?: string;
};

const AREA_RESOLUTION_ERROR =
  "No se pudo determinar el área asignada a tu cuenta. Contacta a administración para verificar tu asignación como titular.";

function buildCreateVacantePayload(
  request: CrearVacanteActionRequest,
  areaId?: number,
  modalidadId?: string,
) {
  return {
    nombre: request.nombre,
    descripcion: request.descripcion,
    perfilRequerido: request.perfilRequerido,
    nivelEducativo: request.nivelEducativo,
    modalidadTrabajo: request.modalidadTrabajo,
    tipoHorario: request.tipoHorario,
    diasDisponibles: request.diasDisponibles,
    horario: request.horario,
    direccion: request.direccion,
    cupoTotal: request.cupoTotal,
    requiereExamen: request.requiereExamen,
    requisitos: request.requisitos,
    actividades: request.actividades,
    beneficios: request.beneficios,
    ...(areaId ? { areaId } : {}),
    ...(modalidadId ? { modalidadId } : {}),
  };
}

export async function getVacanteDetailAction(
  idVacante: number,
): Promise<ActionResult<VacanteDetalleResponse>> {
  return runServerAction(
    () => getVacante(idVacante),
    "No pudimos cargar la información de la vacante.",
  );
}

export async function createVacanteAction(
  request: CrearVacanteActionRequest,
): Promise<ActionResult<VacanteDetalleResponse>> {
  const result = await runServerAction(async () => {
    const session = await requireServerSession();
    const vacantes = await listVacantes();

    let areaId = normalizeOptionalNumber(request.areaId);
    const modalidadId = normalizeOptionalString(request.modalidadId);

    if (!modalidadId) {
      throw new Error(
        "Selecciona el tipo de vacante: servicio social, prácticas profesionales o residencias.",
      );
    }

    if (!areaId) {
      const areaContext = await resolveTitularAreaContext(vacantes, session.idUsuario);
      areaId = areaContext?.areaId;
    }

    if (areaId) {
      return createVacante(buildCreateVacantePayload(request, areaId, modalidadId));
    }

    try {
      return await createVacante(buildCreateVacantePayload(request, undefined, modalidadId));
    } catch {
      throw new Error(AREA_RESOLUTION_ERROR);
    }
  }, "No pudimos registrar la vacante.");

  if (result.success) {
    revalidateTitularSection("vacantes");
    revalidateTitularSection("inicio");
  }

  return result;
}

export async function updateVacanteAction(
  idVacante: number,
  request: ActualizarVacanteRequest,
): Promise<ActionResult<VacanteDetalleResponse>> {
  const result = await runServerAction(
    () => updateVacante(idVacante, request),
    "No pudimos actualizar la vacante.",
  );

  if (result.success) {
    revalidateTitularSection("vacantes");
  }

  return result;
}

export async function sendVacanteToReviewAction(
  idVacante: number,
): Promise<ActionResult<VacanteDetalleResponse>> {
  const result = await runServerAction(
    () => sendVacanteToReview(idVacante),
    "No pudimos enviar la vacante a revisión.",
  );

  if (result.success) {
    revalidateTitularSection("vacantes");
    revalidateTitularSection("inicio");
  }

  return result;
}

export async function cancelVacanteAction(
  idVacante: number,
): Promise<ActionResult<VacanteDetalleResponse>> {
  const result = await runServerAction(
    () => cancelVacante(idVacante),
    "No pudimos cancelar la vacante.",
  );

  if (result.success) {
    revalidateTitularSection("vacantes");
    revalidateTitularSection("inicio");
  }

  return result;
}
