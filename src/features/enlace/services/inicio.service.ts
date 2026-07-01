import { serverApiRequest } from "@/lib/api/server-request";
import type { DashboardResumenResponse } from "../types/enlace.types";

export { getHealth } from "@/lib/api/health";

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
