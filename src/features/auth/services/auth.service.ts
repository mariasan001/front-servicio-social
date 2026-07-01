import { apiRequest } from "@/lib/api/client";
import type { AuthUser, LoginRequest } from "@/lib/api/types";

export async function login(request: LoginRequest) {
  const response = await apiRequest<AuthUser>("/auth/login", {
    method: "POST",
    body: request,
  });

  if (!response.data) {
    throw new Error("No se recibió información del usuario autenticado.");
  }

  return response.data;
}

export async function getCurrentUser() {
  const response = await apiRequest<AuthUser>("/auth/me", {
    method: "GET",
  });

  return response.data;
}

export async function logout() {
  await apiRequest<null>("/auth/logout", {
    method: "POST",
  });
}
