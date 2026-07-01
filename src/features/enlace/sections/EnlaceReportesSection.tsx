import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { ENLACE_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getReporteAlumnos } from "../services/reportes.service";

export async function EnlaceReportesSection() {
  const probes = await Promise.all([
    runApiProbe(
      "Reporte de alumnos",
      "GET /api/enlace/reportes/alumnos",
      () => getReporteAlumnos(),
    ),
  ]);

  return (
    <ApiSection
      sectionId="enlace-reportes"
      title="Reportes"
      description="Reportes institucionales de alumnos y procesos de la escuela."
      endpoints={ENLACE_SECTION_ENDPOINTS.reportes}
      probes={probes}
    />
  );
}
