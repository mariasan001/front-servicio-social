import { getApiErrorMessage } from "@/lib/api/errors";
import { requireServerSession } from "@/lib/auth/session.server";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AlumnoVacantesView } from "../components/vacantes/AlumnoVacantesView";
import { getProcesoActual } from "../services/inicio.service";
import { listVacantes } from "../services/vacantes.service";

export async function AlumnoVacantesSection() {
  const result = await requireServerSession()
    .then(async (session) => {
      const [vacantes, procesoActual] = await Promise.all([
        listVacantes(),
        getProcesoActual().catch(() => null),
      ]);
      return { session, vacantes, procesoActual };
    })
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar las vacantes."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="alumno-vacantes-error-title">
        <PageHeader
          titleId="alumno-vacantes-error-title"
          title="Vacantes"
          description="Oportunidades disponibles para postularte."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return (
    <AlumnoVacantesView
      vacantes={result.vacantes}
      nombreCompleto={result.session.nombreCompleto}
      procesoActual={result.procesoActual ?? null}
    />
  );
}
