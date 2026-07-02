import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { EnlaceReportesView } from "../components/reportes/EnlaceReportesView";
import { getReporteAlumnos } from "../services/reportes.service";

export async function EnlaceReportesSection() {
  const result = await getReporteAlumnos().catch((error: unknown) => ({
    error: getApiErrorMessage(error, "No pudimos cargar el reporte de alumnos."),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="enlace-reportes-error-title">
        <PageHeader
          titleId="enlace-reportes-error-title"
          eyebrow="Enlace escolar"
          title="Reportes"
          description="Reportes institucionales de alumnos y procesos de la escuela."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <EnlaceReportesView reporte={result} />;
}
