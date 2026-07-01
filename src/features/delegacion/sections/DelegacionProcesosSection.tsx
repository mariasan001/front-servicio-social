import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { DELEGACION_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getProceso, listProcesos } from "../services/procesos.service";
import type { ProcesoResponse } from "../types/delegacion.types";

export async function DelegacionProcesosSection() {
  const probes = await probeListAndDetail<ProcesoResponse>({
    listLabel: "Listado de procesos",
    listPath: "GET /api/delegacion/procesos",
    detailLabelPrefix: "Detalle proceso",
    detailPath: (id) => `GET /api/delegacion/procesos/${id}`,
    listRequest: () => listProcesos(),
    detailRequest: (id) => getProceso(id),
    idKey: "idProceso",
  });

  return (
    <ApiSection
      sectionId="delegacion-procesos"
      title="Procesos"
      description="Procesos activos de alumnos en servicio social o residencia."
      endpoints={DELEGACION_SECTION_ENDPOINTS.procesos}
      probes={probes}
    />
  );
}
