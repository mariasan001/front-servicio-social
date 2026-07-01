import { apiRequest } from "@/lib/api/client";
import type {
  RegistroAlumnoConTokenRequest,
  RegistroAlumnoResponse,
  RegistroAlumnoSinTokenRequest,
  ValidarTokenRegistroResponse,
} from "@/lib/api/types";

export async function validateRegistrationToken(token: string) {
  const response = await apiRequest<ValidarTokenRegistroResponse>(
    `/api/public/registro/tokens/${encodeURIComponent(token)}`,
    { method: "GET" },
  );

  return response.data;
}

export async function registerWithToken(request: RegistroAlumnoConTokenRequest) {
  const response = await apiRequest<RegistroAlumnoResponse>(
    "/api/public/alumnos/registro-con-token",
    {
      method: "POST",
      body: request,
    },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación del registro.");
  }

  return response.data;
}

export async function registerWithoutToken(
  request: RegistroAlumnoSinTokenRequest,
) {
  const response = await apiRequest<RegistroAlumnoResponse>(
    "/api/public/alumnos/registro-sin-token",
    {
      method: "POST",
      body: request,
    },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación del registro.");
  }

  return response.data;
}
