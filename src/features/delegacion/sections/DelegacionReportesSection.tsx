import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionReportesView } from "../components/reportes/DelegacionReportesView";
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
  const result = await Promise.all([
    getReporteVacantes({ page: 0, size: 20 }),
    getReportePostulaciones({ page: 0, size: 20 }),
    getReporteProcesos({ page: 0, size: 20 }),
    getReporteLiberaciones({ page: 0, size: 20 }),
    getReporteIncidencias({ page: 0, size: 20 }),
    getReporteHoras({ page: 0, size: 20 }),
    getReporteDocumentos({ page: 0, size: 20 }),
  ])
    .then(([vacantes, postulaciones, procesos, liberaciones, incidencias, horas, documentos]) => ({
      initialReports: {
        vacantes,
        postulaciones,
        procesos,
        liberaciones,
        incidencias,
        horas,
        documentos,
      },
    }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar los reportes."),
    }));

  if ("error" in result) {
    return (
      <section>
        <PageHeader titleId="delegacion-rep-error" eyebrow="Delegación" title="Reportes" description="Indicadores y exportaciones." />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <DelegacionReportesView initialReports={result.initialReports} />;
}
