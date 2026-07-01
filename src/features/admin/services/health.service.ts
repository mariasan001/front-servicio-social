import { serverApiRequest } from "@/lib/api/server-request";
import type { HealthResponse } from "../types/health.types";

export async function getHealth() {
  const response = await serverApiRequest<HealthResponse>("/api/health", {
    method: "GET",
    auth: false,
  });

  return response.data;
}
