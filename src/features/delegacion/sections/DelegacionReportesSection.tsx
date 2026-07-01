import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { DELEGACION_SECTION_ENDPOINTS } from "../constants/endpoints";
import {
  getReporteDocumentos,
  getReporteHoras,
  getReporteIncidencias,
  getReporteLiberaciones,
  getReportePostulaciones,
  getReporteProcesos,
  getReporteVacantes,
} from "../services/reportes.service";

export async function DelegacionReportesSection() {
  const probes = await Promise.all([
    runApiProbe("Reporte de vacantes", "GET /api/delegacion/reportes/vacantes", () =>
      getReporteVacantes({ page: 0, size: 5 }),
    ),
    runApiProbe(
      "Reporte de postulaciones",
      "GET /api/delegacion/reportes/postulaciones",
      () => getReportePostulaciones({ page: 0, size: 5 }),
    ),
    runApiProbe("Reporte de procesos", "GET /api/delegacion/reportes/procesos", () =>
      getReporteProcesos({ page: 0, size: 5 }),
    ),
    runApiProbe(
      "Reporte de liberaciones",
      "GET /api/delegacion/reportes/liberaciones",
      () => getReporteLiberaciones({ page: 0, size: 5 }),
    ),
    runApiProbe(
      "Reporte de incidencias",
      "GET /api/delegacion/reportes/incidencias",
      () => getReporteIncidencias({ page: 0, size: 5 }),
    ),
    runApiProbe("Reporte de horas", "GET /api/delegacion/reportes/horas", () =>
      getReporteHoras({ page: 0, size: 5 }),
    ),
    runApiProbe(
      "Reporte de documentos",
      "GET /api/delegacion/reportes/documentos",
      () => getReporteDocumentos({ page: 0, size: 5 }),
    ),
  ]);

  return (
    <ApiSection
      sectionId="delegacion-reportes"
      title="Reportes"
      description="Indicadores paginados y exportaciones del panel de delegación."
      endpoints={DELEGACION_SECTION_ENDPOINTS.reportes}
      probes={probes}
    />
  );
}
