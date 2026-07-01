import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { DELEGACION_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getPostulacion, listPostulaciones } from "../services/postulaciones.service";
import type { PostulacionResponse } from "../types/delegacion.types";

export async function DelegacionPostulacionesSection() {
  const probes = await probeListAndDetail<PostulacionResponse>({
    listLabel: "Listado de postulaciones",
    listPath: "GET /api/delegacion/postulaciones",
    detailLabelPrefix: "Detalle postulación",
    detailPath: (id) => `GET /api/delegacion/postulaciones/${id}`,
    listRequest: () => listPostulaciones(),
    detailRequest: (id) => getPostulacion(id),
    idKey: "idPostulacion",
  });

  return (
    <ApiSection
      sectionId="delegacion-postulaciones"
      title="Postulaciones"
      description="Seguimiento de postulaciones recibidas en el programa."
      endpoints={DELEGACION_SECTION_ENDPOINTS.postulaciones}
      probes={probes}
    />
  );
}
