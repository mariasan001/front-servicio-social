import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { ENLACE_SECTION_ENDPOINTS } from "../constants/endpoints";
import { listAlumnos } from "../services/alumnos.service";
import {
  getProceso,
  getProcesoHorasResumen,
  listProcesoCartas,
  listProcesoDocumentos,
} from "../services/procesos.service";
import type { AlumnoResponse } from "../types/enlace.types";

export async function EnlaceProcesosSection() {
  const listProbe = await runApiProbe(
    "Alumnos con proceso activo",
    "GET /api/enlace/alumnos",
    () => listAlumnos(),
  );

  const probes = [listProbe];

  const firstProcesoId = listProbe.ok
    ? (listProbe.data as AlumnoResponse[] | undefined)?.find(
        (alumno) => typeof alumno.procesoId === "number",
      )?.procesoId
    : undefined;

  if (typeof firstProcesoId === "number") {
    probes.push(
      await runApiProbe(
        `Detalle proceso #${firstProcesoId}`,
        `GET /api/enlace/procesos/${firstProcesoId}`,
        () => getProceso(firstProcesoId),
      ),
      await runApiProbe(
        `Resumen horas proceso #${firstProcesoId}`,
        `GET /api/enlace/procesos/${firstProcesoId}/horas/resumen`,
        () => getProcesoHorasResumen(firstProcesoId),
      ),
      await runApiProbe(
        `Documentos proceso #${firstProcesoId}`,
        `GET /api/enlace/procesos/${firstProcesoId}/documentos`,
        () => listProcesoDocumentos(firstProcesoId),
      ),
      await runApiProbe(
        `Cartas proceso #${firstProcesoId}`,
        `GET /api/enlace/procesos/${firstProcesoId}/cartas`,
        () => listProcesoCartas(firstProcesoId),
      ),
    );
  }

  return (
    <ApiSection
      sectionId="enlace-procesos"
      title="Procesos"
      description="Seguimiento de procesos activos. El ID se obtiene del listado de alumnos (no hay listado global de procesos)."
      endpoints={ENLACE_SECTION_ENDPOINTS.procesos}
      probes={probes}
    />
  );
}
