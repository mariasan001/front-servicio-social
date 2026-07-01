import { serverApiRequest } from "@/lib/api/server-request";
import type { ActualizarCvRequest, CvResponse } from "../types/alumno.types";

export async function getCv() {
  const response = await serverApiRequest<CvResponse>("/api/alumno/cv", {
    method: "GET",
  });

  if (!response.data) {
    throw new Error("No se recibió el CV del alumno.");
  }

  return response.data;
}

export async function updateCv(request: ActualizarCvRequest) {
  const response = await serverApiRequest<CvResponse>("/api/alumno/cv", {
    method: "PATCH",
    body: request,
  });

  if (!response.data) {
    throw new Error("No se recibió confirmación de actualización del CV.");
  }

  return response.data;
}
