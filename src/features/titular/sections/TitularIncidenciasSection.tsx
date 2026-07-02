import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { TitularIncidenciasView } from "../components/incidencias/TitularIncidenciasView";
import { listIncidencias } from "../services/incidencias.service";

export async function TitularIncidenciasSection() {
  const result = await listIncidencias()
    .then((incidencias) => ({ incidencias }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar las incidencias."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="titular-incidencias-error-title">
        <PageHeader
          titleId="titular-incidencias-error-title"
          title="Incidencias"
          description="Consulta de incidencias."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <TitularIncidenciasView incidencias={result.incidencias} />;
}
