import { serverApiRequest } from "@/lib/api/server-request";
import type {
  HorasResumenResponse,
  HoraResponse,
  NotificacionesNoLeidasResponse,
  ProcesoDetalleResponse,
} from "../types/alumno.types";
import {
  getProcesoHorasResumen,
  listProcesoHoras,
  listProcesoIncidencias,
} from "./proceso.service";
import { resolveHoraFechaKey } from "../lib/horas-calendar.utils";

export type AlumnoInicioStats = {
  horasAcumuladas: number;
  horasRequeridas: number | null;
  horasRegistradas: number;
  incidenciasTotales: number;
  ultimoRegistro: string | null;
};

export type AlumnoInicioDashboard = {
  horas: HoraResponse[];
  stats: AlumnoInicioStats;
};

function toNumber(value?: number | string | null) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildAlumnoInicioStats(
  horas: HoraResponse[],
  horasResumen: HorasResumenResponse | null,
  incidenciasTotales: number,
): AlumnoInicioStats {
  const horasAcumuladas = toNumber(horasResumen?.horasAcumuladas);
  const horasRequeridas =
    horasResumen?.horasRequeridas !== undefined && horasResumen?.horasRequeridas !== null
      ? toNumber(horasResumen.horasRequeridas)
      : null;

  const horasRegistradas = horas.reduce(
    (sum, hora) => sum + toNumber(hora.horasRegistradas),
    0,
  );

  const ultimoRegistro =
    [...horas]
      .map((hora) => resolveHoraFechaKey(hora.fecha))
      .filter((fecha): fecha is string => Boolean(fecha))
      .sort((a, b) => b.localeCompare(a))[0] ?? null;

  return {
    horasAcumuladas,
    horasRequeridas,
    horasRegistradas,
    incidenciasTotales,
    ultimoRegistro,
  };
}

export async function loadAlumnoInicioDashboard(idProceso: number): Promise<AlumnoInicioDashboard> {
  const [horasResumen, horas, incidencias] = await Promise.all([
    getProcesoHorasResumen(idProceso).catch(() => null),
    listProcesoHoras(idProceso),
    listProcesoIncidencias(idProceso).catch(() => []),
  ]);

  return {
    horas,
    stats: buildAlumnoInicioStats(horas, horasResumen, incidencias.length),
  };
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
