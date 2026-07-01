import { ApiSection, probeListAndDetail } from "@/shared/components/ApiSection";
import { DELEGACION_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getAlumnoCv, listAlumnosPorNormalizar } from "../services/alumnos.service";
import type { AlumnoPorNormalizarResponse } from "../types/delegacion.types";

export async function DelegacionAlumnosSection() {
  const probes = await probeListAndDetail<AlumnoPorNormalizarResponse>({
    listLabel: "Alumnos con escuela por normalizar",
    listPath: "GET /api/delegacion/alumnos/escuela-por-normalizar",
    detailLabelPrefix: "CV alumno",
    detailPath: (id) => `GET /api/delegacion/alumnos/${id}/cv`,
    listRequest: () => listAlumnosPorNormalizar(),
    detailRequest: (id) => getAlumnoCv(id),
    idKey: "idAlumno",
  });

  return (
    <ApiSection
      sectionId="delegacion-alumnos"
      title="Alumnos"
      description="Normalización de escuelas capturadas por alumnos."
      endpoints={DELEGACION_SECTION_ENDPOINTS.alumnos}
      probes={probes}
    />
  );
}
