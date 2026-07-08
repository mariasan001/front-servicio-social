import { serverApiRequest } from "@/lib/api/server-request";
import type {
  AlumnoExamenDisponibleResponse,
  FinalizarExamenRequest,
  FinalizarExamenResponse,
  IntentoExamenResponse,
} from "@/lib/domain";

export async function getExamenPostulacion(idPostulacion: number) {
  const response = await serverApiRequest<AlumnoExamenDisponibleResponse>(
    `/api/alumno/postulaciones/${idPostulacion}/examen`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el examen disponible.");
  }

  return response.data;
}

export async function iniciarExamenPostulacion(idPostulacion: number) {
  const response = await serverApiRequest<IntentoExamenResponse>(
    `/api/alumno/postulaciones/${idPostulacion}/examen/iniciar`,
    { method: "POST" },
  );

  if (!response.data) {
    throw new Error("No se pudo iniciar el examen.");
  }

  return response.data;
}

export async function finalizarExamenPostulacion(
  idPostulacion: number,
  request: FinalizarExamenRequest,
) {
  const response = await serverApiRequest<FinalizarExamenResponse>(
    `/api/alumno/postulaciones/${idPostulacion}/examen/finalizar`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se pudo finalizar el examen.");
  }

  return response.data;
}
