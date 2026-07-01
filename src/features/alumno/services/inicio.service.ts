import { serverApiRequest } from "@/lib/api/server-request";
import type {
  NotificacionesNoLeidasResponse,
  ProcesoDetalleResponse,
} from "../types/alumno.types";

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

export async function getProcesoActual() {
  const response = await serverApiRequest<ProcesoDetalleResponse>(
    "/api/alumno/procesos/actual",
    { method: "GET" },
  );

  return response.data;
}

export async function countNotificacionesNoLeidas() {
  const response = await serverApiRequest<NotificacionesNoLeidasResponse>(
    "/api/notificaciones/no-leidas/count",
    { method: "GET" },
  );

  return response.data;
}
