import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionProcesosView } from "../components/procesos/DelegacionProcesosView";
import { listProcesos } from "../services/procesos.service";

export async function DelegacionProcesosSection() {
  const result = await listProcesos()
    .then((procesos) => ({ procesos }))
    .catch((error: unknown) => ({ error: getApiErrorMessage(error, "No pudimos cargar los procesos.") }));

  if ("error" in result) {
    return (
      <section>
        <PageHeader titleId="delegacion-proc-error" title="Procesos" description="Procesos activos de alumnos." />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <DelegacionProcesosView procesos={result.procesos} />;
}
