import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import type { EscuelaResponse } from "../types/escuela.types";
import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import {
  getEscuela,
  listEscuelaTokens,
  listEscuelas,
} from "../services/escuelas.service";

export async function AdminEscuelasSection() {
  const probes = await probeListAndDetail<EscuelaResponse>({
    listLabel: "Listado de escuelas",
    listPath: "GET /api/escuelas",
    detailLabelPrefix: "Detalle escuela",
    detailPath: (id) => `GET /api/escuelas/${id}`,
    listRequest: () => listEscuelas(),
    detailRequest: (id) => getEscuela(id),
    idKey: "idEscuela",
    extraProbes: (id) => [
      {
        label: `Tokens escuela #${id}`,
        path: `GET /api/escuelas/${id}/tokens`,
        request: () => listEscuelaTokens(id),
      },
    ],
  });

  return (
    <ApiSection
      sectionId="admin-escuelas"
      title="Escuelas"
      description="Instituciones educativas y tokens de registro."
      endpoints={ADMIN_SECTION_ENDPOINTS.escuelas}
      probes={probes}
    />
  );
}
