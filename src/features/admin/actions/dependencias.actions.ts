"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateAdminSection } from "../lib/revalidate-admin";
import {
  activateDependencia,
  createDependencia,
  deactivateDependencia,
  getDependencia,
  updateDependencia,
} from "../services/dependencias.service";
import type {
  ActualizarDependenciaRequest,
  CrearDependenciaRequest,
  DependenciaResponse,
} from "../types/dependencia.types";

export async function getDependenciaDetailAction(
  idDependencia: number,
): Promise<ActionResult<DependenciaResponse>> {
  return runServerAction(
    () => getDependencia(idDependencia),
    "No pudimos cargar la información de la dependencia. Intenta de nuevo en unos momentos.",
  );
}

export async function createDependenciaAction(
  request: CrearDependenciaRequest,
): Promise<ActionResult<DependenciaResponse>> {
  const result = await runServerAction(
    () => createDependencia(request),
    "No pudimos registrar la dependencia. Revisa los datos e intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("dependencias");
    revalidateAdminSection("areas");
  }

  return result;
}

export async function updateDependenciaAction(
  idDependencia: number,
  request: ActualizarDependenciaRequest,
): Promise<ActionResult<DependenciaResponse>> {
  const result = await runServerAction(
    () => updateDependencia(idDependencia, request),
    "No pudimos actualizar la dependencia. Revisa los datos e intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("dependencias");
    revalidateAdminSection("areas");
  }

  return result;
}

export async function activateDependenciaAction(
  idDependencia: number,
): Promise<ActionResult<DependenciaResponse>> {
  const result = await runServerAction(
    () => activateDependencia(idDependencia),
    "No pudimos activar la dependencia. Intenta de nuevo en unos momentos.",
  );

  if (result.success) {
    revalidateAdminSection("dependencias");
    revalidateAdminSection("areas");
  }

  return result;
}

export async function deactivateDependenciaAction(
  idDependencia: number,
): Promise<ActionResult<DependenciaResponse>> {
  const result = await runServerAction(
    () => deactivateDependencia(idDependencia),
    "No pudimos desactivar la dependencia. Intenta de nuevo en unos momentos.",
  );

  if (result.success) {
    revalidateAdminSection("dependencias");
    revalidateAdminSection("areas");
  }

  return result;
}
