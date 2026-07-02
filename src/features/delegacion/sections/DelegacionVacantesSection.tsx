import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionVacantesView } from "../components/vacantes/DelegacionVacantesView";
import { listVacantes } from "../services/vacantes.service";

export async function DelegacionVacantesSection() {
  const result = await listVacantes()
    .then((vacantes) => ({ vacantes }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar el listado de vacantes."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="delegacion-vacantes-error-title">
        <PageHeader titleId="delegacion-vacantes-error-title" title="Vacantes" description="Gestión y revisión de vacantes." />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <DelegacionVacantesView vacantes={result.vacantes} />;
}
