import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { ALUMNO_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getProcesoActual } from "../services/inicio.service";
import {
  getCartaAceptacion,
  getCartaLiberacion,
  getProceso,
  getProcesoEvaluacionFinal,
  getProcesoHorasResumen,
  getProcesoLiberacionTecnica,
  listProcesoCartas,
  listProcesoDocumentos,
  listProcesoHoras,
  listProcesoIncidencias,
  listProcesos,
} from "../services/proceso.service";
import type { ProcesoDetalleResponse, ProcesoResponse } from "../types/alumno.types";

export async function AlumnoProcesoSection() {
  const actualProbe = await runApiProbe(
    "Proceso actual",
    "GET /api/alumno/procesos/actual",
    () => getProcesoActual(),
  );

  const probes = [actualProbe];

  let idProceso =
    actualProbe.ok &&
    typeof (actualProbe.data as ProcesoDetalleResponse | null)?.idProceso ===
      "number"
      ? (actualProbe.data as ProcesoDetalleResponse).idProceso
      : undefined;

  if (typeof idProceso !== "number") {
    const listProbe = await runApiProbe(
      "Listado de procesos",
      "GET /api/alumno/procesos",
      () => listProcesos(),
    );
    probes.push(listProbe);
    idProceso = listProbe.ok
      ? (listProbe.data as ProcesoResponse[] | undefined)?.[0]?.idProceso
      : undefined;
  }

  if (typeof idProceso === "number") {
    probes.push(
      await runApiProbe(
        `Detalle proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}`,
        () => getProceso(idProceso),
      ),
      await runApiProbe(
        `Horas proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}/horas`,
        () => listProcesoHoras(idProceso),
      ),
      await runApiProbe(
        `Resumen horas proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}/horas/resumen`,
        () => getProcesoHorasResumen(idProceso),
      ),
      await runApiProbe(
        `Documentos proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}/documentos`,
        () => listProcesoDocumentos(idProceso),
      ),
      await runApiProbe(
        `Cartas proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}/cartas`,
        () => listProcesoCartas(idProceso),
      ),
      await runApiProbe(
        `Carta aceptación proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}/carta-aceptacion`,
        () => getCartaAceptacion(idProceso),
      ),
      await runApiProbe(
        `Carta liberación proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}/carta-liberacion`,
        () => getCartaLiberacion(idProceso),
      ),
      await runApiProbe(
        `Incidencias proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}/incidencias`,
        () => listProcesoIncidencias(idProceso),
      ),
      await runApiProbe(
        `Liberación técnica proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}/liberacion-tecnica`,
        () => getProcesoLiberacionTecnica(idProceso),
      ),
      await runApiProbe(
        `Evaluación final proceso #${idProceso}`,
        `GET /api/alumno/procesos/${idProceso}/evaluacion-final`,
        () => getProcesoEvaluacionFinal(idProceso),
      ),
    );
  }

  return (
    <ApiSection
      sectionId="alumno-proceso"
      title="Mi proceso"
      description="Seguimiento de tu servicio social o residencia. Los archivos binarios no se incluyen en los probes."
      endpoints={ALUMNO_SECTION_ENDPOINTS.proceso}
      probes={probes}
    />
  );
}
