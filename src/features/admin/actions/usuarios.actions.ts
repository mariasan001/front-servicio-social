"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { revalidateAdminSection } from "../lib/revalidate-admin";
import {
  activateUsuarioInterno,
  createUsuarioInterno,
  deactivateUsuarioInterno,
  getUsuarioInterno,
  resetUsuarioInternoPassword,
  updateUsuarioInterno,
} from "../services/usuarios.service";
import type {
  ActualizarUsuarioInternoRequest,
  CrearUsuarioInternoRequest,
  ResetPasswordUsuarioRequest,
  UsuarioInternoResponse,
} from "../types/usuario.types";

export async function getUsuarioDetailAction(
  idUsuario: number,
): Promise<ActionResult<UsuarioInternoResponse>> {
  return runAuthorizedAction([USER_ROLES.ADMINISTRADOR], 
    () => getUsuarioInterno(idUsuario),
    "No pudimos cargar la información del usuario. Intenta de nuevo en unos momentos.",
  );
}

export async function createUsuarioInternoAction(
  request: CrearUsuarioInternoRequest,
): Promise<ActionResult<UsuarioInternoResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => createUsuarioInterno(request),
    "No pudimos dar de alta la cuenta. Revisa los datos e intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("usuarios");
    revalidateAdminSection("areas");
  }

  return result;
}

export async function updateUsuarioInternoAction(
  idUsuario: number,
  request: ActualizarUsuarioInternoRequest,
): Promise<ActionResult<UsuarioInternoResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => updateUsuarioInterno(idUsuario, request),
    "No pudimos actualizar la cuenta. Revisa los datos e intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("usuarios");
    revalidateAdminSection("areas");
  }

  return result;
}

export async function activateUsuarioInternoAction(
  idUsuario: number,
): Promise<ActionResult<UsuarioInternoResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => activateUsuarioInterno(idUsuario),
    "No pudimos activar la cuenta. Intenta de nuevo en unos momentos.",
  );

  if (result.success) {
    revalidateAdminSection("usuarios");
  }

  return result;
}

export async function deactivateUsuarioInternoAction(
  idUsuario: number,
): Promise<ActionResult<UsuarioInternoResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => deactivateUsuarioInterno(idUsuario),
    "No pudimos desactivar la cuenta. Intenta de nuevo en unos momentos.",
  );

  if (result.success) {
    revalidateAdminSection("usuarios");
  }

  return result;
}

export async function resetUsuarioInternoPasswordAction(
  idUsuario: number,
  request: ResetPasswordUsuarioRequest,
): Promise<ActionResult<UsuarioInternoResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ADMINISTRADOR],
    () => resetUsuarioInternoPassword(idUsuario, request),
    "No pudimos restablecer la contraseña. Intenta de nuevo.",
  );

  if (result.success) {
    revalidateAdminSection("usuarios");
  }

  return result;
}
