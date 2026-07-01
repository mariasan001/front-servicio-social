import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { TITULAR_SECTION_ENDPOINTS } from "../constants/endpoints";
import {
  getProceso,
  getProcesoEvaluacionFinal,
  getProcesoLiberacionTecnica,
  listProcesoHoras,
  listProcesoIncidencias,
  listProcesos,
} from "../services/procesos.service";
import type { ProcesoResponse } from "../types/titular.types";

export async function TitularProcesosSection() {
  const probes = await probeListAndDetail<ProcesoResponse>({
    listLabel: "Listado de procesos",
    listPath: "GET /api/titular/procesos",
    detailLabelPrefix: "Detalle proceso",
    detailPath: (id) => `GET /api/titular/procesos/${id}`,
    listRequest: () => listProcesos(),
    detailRequest: (id) => getProceso(id),
    idKey: "idProceso",
    extraProbes: (id) => [
      {
        label: `Horas proceso #${id}`,
        path: `GET /api/titular/procesos/${id}/horas`,
        request: () => listProcesoHoras(id),
      },
      {
        label: `Incidencias proceso #${id}`,
        path: `GET /api/titular/procesos/${id}/incidencias`,
        request: () => listProcesoIncidencias(id),
      },
      {
        label: `Liberación técnica proceso #${id}`,
        path: `GET /api/titular/procesos/${id}/liberacion-tecnica`,
        request: () => getProcesoLiberacionTecnica(id),
      },
      {
        label: `Evaluación final proceso #${id}`,
        path: `GET /api/titular/procesos/${id}/evaluacion-final`,
        request: () => getProcesoEvaluacionFinal(id),
      },
    ],
  });

  return (
    <ApiSection
      sectionId="titular-procesos"
      title="Procesos"
      description="Seguimiento de procesos activos, horas, incidencias y cierre."
      endpoints={TITULAR_SECTION_ENDPOINTS.procesos}
      probes={probes}
    />
  );
}
