import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { TitularExamenesView } from "../components/examenes/TitularExamenesView";
import { listTitularAreas } from "../services/areas.service";
import { listExamenes } from "../services/examenes.service";

export async function TitularExamenesSection() {
  const result = await listExamenes()
    .then(async (examenes) => ({
      examenes,
      areas: await listTitularAreas(),
    }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar los exámenes."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="titular-examenes-error-title">
        <PageHeader
          titleId="titular-examenes-error-title"
          title="Exámenes"
          description="Exámenes diagnóstico de tu área."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return (
    <TitularExamenesView examenes={result.examenes} areas={result.areas} />
  );
}
