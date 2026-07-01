import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { ENLACE_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getAlumno, listAlumnos } from "../services/alumnos.service";
import type { AlumnoResponse } from "../types/enlace.types";

export async function EnlaceAlumnosSection() {
  const probes = await probeListAndDetail<AlumnoResponse>({
    listLabel: "Listado de alumnos",
    listPath: "GET /api/enlace/alumnos",
    detailLabelPrefix: "Detalle alumno",
    detailPath: (id) => `GET /api/enlace/alumnos/${id}`,
    listRequest: () => listAlumnos(),
    detailRequest: (id) => getAlumno(id),
    idKey: "idAlumno",
  });

  return (
    <ApiSection
      sectionId="enlace-alumnos"
      title="Alumnos"
      description="Consulta de alumnos registrados y vinculados a tu escuela."
      endpoints={ENLACE_SECTION_ENDPOINTS.alumnos}
      probes={probes}
    />
  );
}
