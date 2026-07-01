import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { DELEGACION_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getIncidencia, listIncidencias } from "../services/incidencias.service";
import type { IncidenciaResponse } from "../types/delegacion.types";

export async function DelegacionIncidenciasSection() {
  const probes = await probeListAndDetail<IncidenciaResponse>({
    listLabel: "Listado global de incidencias",
    listPath: "GET /api/delegacion/incidencias",
    detailLabelPrefix: "Detalle incidencia",
    detailPath: (id) => `GET /api/delegacion/incidencias/${id}`,
    listRequest: () => listIncidencias(),
    detailRequest: (id) => getIncidencia(id),
    idKey: "idIncidencia",
  });

  return (
    <ApiSection
      sectionId="delegacion-incidencias"
      title="Incidencias"
      description="Gestión de incidencias reportadas en procesos activos."
      endpoints={DELEGACION_SECTION_ENDPOINTS.incidencias}
      probes={probes}
    />
  );
}
