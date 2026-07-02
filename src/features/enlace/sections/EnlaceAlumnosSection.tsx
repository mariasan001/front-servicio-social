import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { EnlaceAlumnosView } from "../components/alumnos/EnlaceAlumnosView";
import { listAlumnos } from "../services/alumnos.service";

export async function EnlaceAlumnosSection() {
  const result = await listAlumnos().catch((error: unknown) => ({
    error: getApiErrorMessage(error, "No pudimos cargar el listado de alumnos."),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="enlace-alumnos-error-title">
        <PageHeader
          titleId="enlace-alumnos-error-title"
          title="Alumnos"
          description="Consulta de alumnos registrados y vinculados a tu escuela."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <EnlaceAlumnosView alumnos={result} />;
}
