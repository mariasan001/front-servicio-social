import { getApiErrorMessage } from "@/lib/api/errors";
import { requireServerSession } from "@/lib/auth/session.server";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { TitularVacantesView } from "../components/vacantes/TitularVacantesView";
import { resolveTitularAreaContext } from "../lib/area-context";
import { listVacantes } from "../services/vacantes.service";

export async function TitularVacantesSection() {
  const result = await requireServerSession()
    .then((session) => listVacantes().then(async (vacantes) => ({
      vacantes,
      areaContext: await resolveTitularAreaContext(vacantes, session.idUsuario),
    })))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar las vacantes."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="titular-vacantes-error-title">
        <PageHeader
          titleId="titular-vacantes-error-title"
          title="Vacantes"
          description="Gestión de vacantes del área."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return (
    <TitularVacantesView vacantes={result.vacantes} areaContext={result.areaContext} />
  );
}
