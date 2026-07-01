import { apiRequest } from "@/lib/api/client";
import type {
  ConfirmarRecuperacionContrasenaRequest,
  ConfirmarRecuperacionContrasenaResponse,
  SolicitarRecuperacionContrasenaRequest,
  SolicitarRecuperacionContrasenaResponse,
} from "@/lib/api/types";

export async function requestPasswordReset(
  request: SolicitarRecuperacionContrasenaRequest,
) {
  const response = await apiRequest<SolicitarRecuperacionContrasenaResponse>(
    "/api/public/auth/recuperacion-contrasena/solicitar",
    {
      method: "POST",
      body: request,
    },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación del envío del código.");
  }

  return response.data;
}

export async function confirmPasswordReset(
  request: ConfirmarRecuperacionContrasenaRequest,
) {
  const response = await apiRequest<ConfirmarRecuperacionContrasenaResponse>(
    "/api/public/auth/recuperacion-contrasena/confirmar",
    {
      method: "POST",
      body: request,
    },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación del restablecimiento.");
  }

  return response.data;
}
