"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { revalidateAlumnoSection } from "../lib/revalidate-alumno";
import {
  markAllNotificacionesRead,
  markNotificacionRead,
} from "../services/notificaciones.service";
import type { NotificacionResponse } from "../types/alumno.types";

export async function markNotificacionReadAction(
  idNotificacion: number,
): Promise<ActionResult<NotificacionResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ALUMNO],
    () => markNotificacionRead(idNotificacion),
    "No pudimos marcar la notificación como leída.",
  );

  if (result.success) {
    revalidateAlumnoSection("inicio");
  }

  return result;
}

export async function markAllNotificacionesReadAction(): Promise<ActionResult<unknown>> {
  const result = await runAuthorizedAction([USER_ROLES.ALUMNO],
    () => markAllNotificacionesRead(),
    "No pudimos marcar todas las notificaciones como leídas.",
  );

  if (result.success) {
    revalidateAlumnoSection("inicio");
  }

  return result;
}
