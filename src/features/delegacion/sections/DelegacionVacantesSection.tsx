import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { DELEGACION_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getVacante, listVacantes } from "../services/vacantes.service";
import type { VacanteResponse } from "../types/delegacion.types";

export async function DelegacionVacantesSection() {
  const probes = await probeListAndDetail<VacanteResponse>({
    listLabel: "Listado de vacantes",
    listPath: "GET /api/delegacion/vacantes",
    detailLabelPrefix: "Detalle vacante",
    detailPath: (id) => `GET /api/delegacion/vacantes/${id}`,
    listRequest: () => listVacantes(),
    detailRequest: (id) => getVacante(id),
    idKey: "idVacante",
  });

  return (
    <ApiSection
      sectionId="delegacion-vacantes"
      title="Vacantes"
      description="Gestión y revisión de vacantes publicadas por titulares."
      endpoints={DELEGACION_SECTION_ENDPOINTS.vacantes}
      probes={probes}
    />
  );
}
