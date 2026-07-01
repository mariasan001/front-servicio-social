import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { TITULAR_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getPostulacion, listPostulaciones } from "../services/postulaciones.service";
import type { PostulacionResponse } from "../types/titular.types";

export async function TitularPostulacionesSection() {
  const probes = await probeListAndDetail<PostulacionResponse>({
    listLabel: "Listado de postulaciones",
    listPath: "GET /api/titular/postulaciones",
    detailLabelPrefix: "Detalle postulación",
    detailPath: (id) => `GET /api/titular/postulaciones/${id}`,
    listRequest: () => listPostulaciones(),
    detailRequest: (id) => getPostulacion(id),
    idKey: "idPostulacion",
  });

  return (
    <ApiSection
      sectionId="titular-postulaciones"
      title="Postulaciones"
      description="Revisión de candidatos postulados a vacantes de tu área."
      endpoints={TITULAR_SECTION_ENDPOINTS.postulaciones}
      probes={probes}
    />
  );
}
