import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import type { DependenciaResponse } from "../types/dependencia.types";
import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import {
  getDependencia,
  listDependencias,
} from "../services/dependencias.service";

export async function AdminDependenciasSection() {
  const probes = await probeListAndDetail<DependenciaResponse>({
    listLabel: "Listado de dependencias",
    listPath: "GET /api/dependencias",
    detailLabelPrefix: "Detalle dependencia",
    detailPath: (id) => `GET /api/dependencias/${id}`,
    listRequest: () => listDependencias(),
    detailRequest: (id) => getDependencia(id),
    idKey: "idDependencia",
  });

  return (
    <ApiSection
      sectionId="admin-dependencias"
      title="Dependencias"
      description="Catálogo de dependencias receptoras."
      endpoints={ADMIN_SECTION_ENDPOINTS.dependencias}
      probes={probes}
    />
  );
}
