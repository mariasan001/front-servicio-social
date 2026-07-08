import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ExamenDiagnosticoDetalleResponse,
  ExamenDiagnosticoResumenResponse,
  ResultadoExamenResponse,
} from "@/lib/domain";

export type ListExamenesMonitorFilters = {
  estatus?: string;
  areaId?: number;
};

export async function listExamenesMonitor(filters?: ListExamenesMonitorFilters) {
  const response = await serverApiRequest<ExamenDiagnosticoResumenResponse[]>(
    `/api/delegacion/examenes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getExamenMonitor(idExamen: number) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/delegacion/examenes/${idExamen}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle del examen.");
  }

  return response.data;
}

export async function getResultadoExamenMonitor(idPostulacion: number) {
  const response = await serverApiRequest<ResultadoExamenResponse>(
    `/api/delegacion/postulaciones/${idPostulacion}/examen/resultado`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el resultado del examen.");
  }

  return response.data;
}
