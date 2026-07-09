import { apiRequest } from "@/lib/api/client";
import { buildQuery } from "@/lib/api/query";
import { publicApiGetPage } from "@/lib/api/public-request";
import type {
  CrearEncuestaSatisfaccionRequest,
  EncuestaSatisfaccionResponse,
} from "@/lib/types/public-encuesta";

const PUBLIC_ENCUESTAS_PAGE_SIZE = 12;

export async function listPublicEncuestasSatisfaccion() {
  return publicApiGetPage<EncuestaSatisfaccionResponse>(
    `/api/public/encuestas-satisfaccion${buildQuery({
      page: 0,
      size: PUBLIC_ENCUESTAS_PAGE_SIZE,
    })}`,
  );
}

export async function registerPublicEncuestaSatisfaccion(
  request: CrearEncuestaSatisfaccionRequest,
) {
  const response = await apiRequest<EncuestaSatisfaccionResponse>(
    "/api/public/encuestas-satisfaccion",
    {
      method: "POST",
      body: request,
    },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación del registro de la encuesta.");
  }

  return response.data;
}
