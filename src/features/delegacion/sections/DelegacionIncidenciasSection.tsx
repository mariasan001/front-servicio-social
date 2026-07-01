import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionIncidenciasView } from "../components/incidencias/DelegacionIncidenciasView";
import { listIncidencias } from "../services/incidencias.service";

export async function DelegacionIncidenciasSection() {
  const result = await listIncidencias()
    .then((incidencias) => ({ incidencias }))
    .catch((error: unknown) => ({ error: getApiErrorMessage(error, "No pudimos cargar las incidencias.") }));

  if ("error" in result) {
    return (
      <section>
        <PageHeader titleId="delegacion-inc-error" eyebrow="Delegación" title="Incidencias" description="Gestión de incidencias." />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <DelegacionIncidenciasView incidencias={result.incidencias} />;
}
