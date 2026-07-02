import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionReportesView } from "../components/reportes/DelegacionReportesView";
import { getAllReportesPreview } from "../services/reportes.service";

export async function DelegacionReportesSection() {
  const result = await getAllReportesPreview({ page: 0, size: 20 })
    .then((initialReports) => ({ initialReports }))
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
