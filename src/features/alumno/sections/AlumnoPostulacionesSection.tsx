import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { ALUMNO_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getPostulacion, listPostulaciones } from "../services/postulaciones.service";
import type { PostulacionResponse } from "../types/alumno.types";

export async function AlumnoPostulacionesSection() {
  const probes = await probeListAndDetail<PostulacionResponse>({
    listLabel: "Mis postulaciones",
    listPath: "GET /api/alumno/postulaciones",
    detailLabelPrefix: "Detalle postulación",
    detailPath: (id) => `GET /api/alumno/postulaciones/${id}`,
    listRequest: () => listPostulaciones(),
    detailRequest: (id) => getPostulacion(id),
    idKey: "idPostulacion",
  });

  return (
    <ApiSection
      sectionId="alumno-postulaciones"
      title="Postulaciones"
      description="Consulta el estatus de tus postulaciones a vacantes."
      endpoints={ALUMNO_SECTION_ENDPOINTS.postulaciones}
      probes={probes}
    />
  );
}
