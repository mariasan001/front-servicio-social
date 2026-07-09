"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { revalidateAdminSection } from "../lib/revalidate-admin";
import {
  activateArea,
  assignAreaTitular,
  createArea,
  deactivateArea,
  deactivateAreaTitular,
  getArea,
  setPrincipalAreaTitular,
  updateArea,
} from "../services/areas.service";
import type {
  ActualizarAreaRequest,
  AreaDetalleResponse,
  AreaResponse,
  CrearAreaRequest,
} from "../types/area.types";
import type { AsignarTitularAreaRequest, TitularAreaResponse } from "../types/titular.types";

export async function getAreaDetailAction(
  idArea: number,
): Promise<ActionResult<AreaDetalleResponse>> {
  return runAuthorizedAction([USER_ROLES.ADMINISTRADOR], 
    () => getArea(idArea),
    "No pudimos cargar la información del área. Intenta de nuevo en unos momentos.",
  );
}

export async function createAreaAction(
  request: CrearAreaRequest,
): Promise<ActionResult<AreaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => createArea(request),
    "No pudimos registrar el área. Revisa los datos e intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("areas");
  }

  return result;
}

export async function updateAreaAction(
  idArea: number,
  request: ActualizarAreaRequest,
): Promise<ActionResult<AreaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => updateArea(idArea, request),
    "No pudimos actualizar el área. Revisa los datos e intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("areas");
  }

  return result;
}

export async function activateAreaAction(
  idArea: number,
): Promise<ActionResult<AreaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => activateArea(idArea),
    "No pudimos activar el área. Intenta de nuevo en unos momentos.",
  );

  if (result.success) {
    revalidateAdminSection("areas");
  }

  return result;
}

export async function deactivateAreaAction(
  idArea: number,
): Promise<ActionResult<AreaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => deactivateArea(idArea),
    "No pudimos desactivar el área. Intenta de nuevo en unos momentos.",
  );

  if (result.success) {
    revalidateAdminSection("areas");
  }

  return result;
}

export async function assignAreaTitularAction(
  idArea: number,
  request: AsignarTitularAreaRequest,
): Promise<ActionResult<TitularAreaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => assignAreaTitular(idArea, request),
    "No pudimos asignar al titular. Verifica la persona seleccionada e intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("areas");
  }

  return result;
}

export async function setPrincipalAreaTitularAction(
  idArea: number,
  idAsignacion: number,
): Promise<ActionResult<TitularAreaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => setPrincipalAreaTitular(idArea, idAsignacion),
    "No pudimos marcar al titular como responsable principal.",
  );

  if (result.success) {
    revalidateAdminSection("areas");
  }

  return result;
}

export async function deactivateAreaTitularAction(
  idArea: number,
  idAsignacion: number,
): Promise<ActionResult<TitularAreaResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => deactivateAreaTitular(idArea, idAsignacion),
    "No pudimos quitar la asignación del titular.",
  );

  if (result.success) {
    revalidateAdminSection("areas");
  }

  return result;
}
