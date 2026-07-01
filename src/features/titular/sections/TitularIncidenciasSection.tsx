import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { TITULAR_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getIncidencia, listIncidencias } from "../services/incidencias.service";
import type { IncidenciaResponse } from "../types/titular.types";

export async function TitularIncidenciasSection() {
  const probes = await probeListAndDetail<IncidenciaResponse>({
    listLabel: "Listado de incidencias",
    listPath: "GET /api/titular/incidencias",
    detailLabelPrefix: "Detalle incidencia",
    detailPath: (id) => `GET /api/titular/incidencias/${id}`,
    listRequest: () => listIncidencias(),
    detailRequest: (id) => getIncidencia(id),
    idKey: "idIncidencia",
  });

  return (
    <ApiSection
      sectionId="titular-incidencias"
      title="Incidencias"
      description="Incidencias reportadas en procesos de tu área."
      endpoints={TITULAR_SECTION_ENDPOINTS.incidencias}
      probes={probes}
    />
  );
}
