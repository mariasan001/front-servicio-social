import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { TITULAR_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getVacante, listVacantes } from "../services/vacantes.service";
import type { VacanteResponse } from "../types/titular.types";

export async function TitularVacantesSection() {
  const probes = await probeListAndDetail<VacanteResponse>({
    listLabel: "Listado de vacantes",
    listPath: "GET /api/titular/vacantes",
    detailLabelPrefix: "Detalle vacante",
    detailPath: (id) => `GET /api/titular/vacantes/${id}`,
    listRequest: () => listVacantes(),
    detailRequest: (id) => getVacante(id),
    idKey: "idVacante",
  });

  return (
    <ApiSection
      sectionId="titular-vacantes"
      title="Vacantes"
      description="Vacantes de tu área: creación, edición y envío a revisión."
      endpoints={TITULAR_SECTION_ENDPOINTS.vacantes}
      probes={probes}
    />
  );
}
