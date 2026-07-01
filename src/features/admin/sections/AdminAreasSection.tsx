import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import type { AreaResponse } from "../types/area.types";
import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import {
  getArea,
  listAreaTitulares,
  listAreas,
} from "../services/areas.service";

export async function AdminAreasSection() {
  const probes = await probeListAndDetail<AreaResponse>({
    listLabel: "Listado de áreas",
    listPath: "GET /api/areas",
    detailLabelPrefix: "Detalle área",
    detailPath: (id) => `GET /api/areas/${id}`,
    listRequest: () => listAreas(),
    detailRequest: (id) => getArea(id),
    idKey: "idArea",
    extraProbes: (id) => [
      {
        label: `Titulares área #${id}`,
        path: `GET /api/areas/${id}/titulares`,
        request: () => listAreaTitulares(id),
      },
    ],
  });

  return (
    <ApiSection
      sectionId="admin-areas"
      title="Áreas"
      description="Áreas receptoras y titulares asignados."
      endpoints={ADMIN_SECTION_ENDPOINTS.areas}
      probes={probes}
    />
  );
}
