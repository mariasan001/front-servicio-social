import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { EnlaceProcesosView } from "../components/procesos/EnlaceProcesosView";
import { listAlumnos } from "../services/alumnos.service";

export async function EnlaceProcesosSection() {
  const result = await listAlumnos().catch((error: unknown) => ({
    error: getApiErrorMessage(error, "No pudimos cargar los procesos."),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="enlace-procesos-error-title">
        <PageHeader
          titleId="enlace-procesos-error-title"
          title="Procesos"
          description="Seguimiento de procesos activos de los alumnos de tu escuela."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <EnlaceProcesosView alumnos={result} />;
}
