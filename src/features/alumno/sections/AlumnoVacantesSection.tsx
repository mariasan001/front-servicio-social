import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { ALUMNO_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getVacante, listVacantes } from "../services/vacantes.service";
import type { VacanteResponse } from "../types/alumno.types";

export async function AlumnoVacantesSection() {
  const probes = await probeListAndDetail<VacanteResponse>({
    listLabel: "Vacantes disponibles",
    listPath: "GET /api/alumno/vacantes",
    detailLabelPrefix: "Detalle vacante",
    detailPath: (id) => `GET /api/alumno/vacantes/${id}`,
    listRequest: () => listVacantes(),
    detailRequest: (id) => getVacante(id),
    idKey: "idVacante",
  });

  return (
    <ApiSection
      sectionId="alumno-vacantes"
      title="Vacantes"
      description="Oportunidades de servicio social y residencia disponibles para postularte."
      endpoints={ALUMNO_SECTION_ENDPOINTS.vacantes}
      probes={probes}
    />
  );
}
