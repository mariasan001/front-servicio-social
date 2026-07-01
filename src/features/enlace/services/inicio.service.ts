import { serverApiRequest } from "@/lib/api/server-request";
import type { DashboardResumenResponse } from "../types/enlace.types";

type HealthResponse = {
  status?: string;
  service?: string;
};

export async function getHealth() {
  const response = await serverApiRequest<HealthResponse>("/api/health", {
    method: "GET",
    auth: false,
  });

  return response.data;
}

export async function getDashboardResumen() {
  const response = await serverApiRequest<DashboardResumenResponse>(
    "/api/enlace/dashboard/resumen",
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el resumen del dashboard.");
  }

  return response.data;
}
