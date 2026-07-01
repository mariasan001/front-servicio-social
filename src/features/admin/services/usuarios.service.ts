import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ActualizarUsuarioInternoRequest,
  CrearUsuarioInternoRequest,
  ListUsuariosInternosFilters,
  ResetPasswordUsuarioRequest,
  UsuarioInternoResponse,
} from "../types/usuario.types";

export async function listUsuariosInternos(
  filters?: ListUsuariosInternosFilters,
) {
  const response = await serverApiRequest<UsuarioInternoResponse[]>(
    `/api/admin/usuarios-internos${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getUsuarioInterno(idUsuario: number) {
  const response = await serverApiRequest<UsuarioInternoResponse>(
    `/api/admin/usuarios-internos/${idUsuario}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle del usuario.");
  }

  return response.data;
}

export async function createUsuarioInterno(request: CrearUsuarioInternoRequest) {
  const response = await serverApiRequest<UsuarioInternoResponse>(
    "/api/admin/usuarios-internos",
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió el usuario creado.");
  }

  return response.data;
}

export async function updateUsuarioInterno(
  idUsuario: number,
  request: ActualizarUsuarioInternoRequest,
) {
  const response = await serverApiRequest<UsuarioInternoResponse>(
    `/api/admin/usuarios-internos/${idUsuario}`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió el usuario actualizado.");
  }

  return response.data;
}

export async function activateUsuarioInterno(idUsuario: number) {
  const response = await serverApiRequest<UsuarioInternoResponse>(
    `/api/admin/usuarios-internos/${idUsuario}/activar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de activación.");
  }

  return response.data;
}

export async function deactivateUsuarioInterno(idUsuario: number) {
  const response = await serverApiRequest<UsuarioInternoResponse>(
    `/api/admin/usuarios-internos/${idUsuario}/desactivar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de desactivación.");
  }

  return response.data;
}

export async function resetUsuarioInternoPassword(
  idUsuario: number,
  request: ResetPasswordUsuarioRequest,
) {
  const response = await serverApiRequest<UsuarioInternoResponse>(
    `/api/admin/usuarios-internos/${idUsuario}/reset-password`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación del restablecimiento.");
  }

  return response.data;
}
