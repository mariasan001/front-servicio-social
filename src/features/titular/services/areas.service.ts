import { serverApiRequest } from "@/lib/api/server-request";
import type { TitularAreaAsignacionResponse } from "../types/titular.types";

export async function listTitularAreas() {
  try {
    const response = await serverApiRequest<TitularAreaAsignacionResponse[]>(
      "/api/titular/areas",
      { method: "GET" },
    );

    return response.data ?? [];
  } catch {
    return [];
  }
}
