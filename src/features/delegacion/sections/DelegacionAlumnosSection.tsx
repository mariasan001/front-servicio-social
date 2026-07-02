import { getApiErrorMessage } from "@/lib/api/errors";
import { listEscuelas } from "@/features/admin/services/escuelas.service";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionAlumnosView } from "../components/alumnos/DelegacionAlumnosView";
import { listAlumnosPorNormalizar } from "../services/alumnos.service";

export async function DelegacionAlumnosSection() {
  const result = await Promise.all([listAlumnosPorNormalizar(), listEscuelas()])
    .then(([alumnos, escuelas]) => ({ alumnos, escuelas }))
    .catch((error: unknown) => ({ error: getApiErrorMessage(error, "No pudimos cargar los alumnos por normalizar.") }));

  if ("error" in result) {
    return (
      <section>
        <PageHeader titleId="delegacion-alu-error" title="Alumnos" description="Normalización de escuelas." />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <DelegacionAlumnosView alumnos={result.alumnos} escuelas={result.escuelas} />;
}
