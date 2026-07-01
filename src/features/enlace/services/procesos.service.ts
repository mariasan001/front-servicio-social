import { serverApiRequest } from "@/lib/api/server-request";
import type {
  CartaMetadataResponse,
  DocumentoEstatusResponse,
  HorasResumenResponse,
  ProcesoDetalleResponse,
} from "../types/enlace.types";

export async function getProceso(idProceso: number) {
  const response = await serverApiRequest<ProcesoDetalleResponse>(
    `/api/enlace/procesos/${idProceso}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle del proceso.");
  }

  return response.data;
}

export async function getProcesoHorasResumen(idProceso: number) {
  const response = await serverApiRequest<HorasResumenResponse>(
    `/api/enlace/procesos/${idProceso}/horas/resumen`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el resumen de horas.");
  }

  return response.data;
}

export async function listProcesoDocumentos(idProceso: number) {
  const response = await serverApiRequest<DocumentoEstatusResponse[]>(
    `/api/enlace/procesos/${idProceso}/documentos`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function listProcesoCartas(idProceso: number) {
  const response = await serverApiRequest<CartaMetadataResponse[]>(
    `/api/enlace/procesos/${idProceso}/cartas`,
    { method: "GET" },
  );

  return response.data ?? [];
}
