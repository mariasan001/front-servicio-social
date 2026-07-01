import { serverApiRequest } from "./server-request";

export type HealthResponse = {
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
