import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { TitularProcesosView } from "../components/procesos/TitularProcesosView";
import { listProcesos } from "../services/procesos.service";

export async function TitularProcesosSection() {
  const result = await listProcesos()
    .then((procesos) => ({ procesos }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar los procesos."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="titular-procesos-error-title">
        <PageHeader
          titleId="titular-procesos-error-title"
          eyebrow="Titular de área"
          title="Procesos"
          description="Supervisión de procesos."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <TitularProcesosView procesos={result.procesos} />;
}
