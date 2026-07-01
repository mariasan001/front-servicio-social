import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionHorasView } from "../components/horas/DelegacionHorasView";
import { listHorasPendientes } from "../services/horas.service";

export async function DelegacionHorasSection() {
  const result = await listHorasPendientes()
    .then((horas) => ({ horas }))
    .catch((error: unknown) => ({ error: getApiErrorMessage(error, "No pudimos cargar las horas pendientes.") }));

  if ("error" in result) {
    return (
      <section>
        <PageHeader titleId="delegacion-horas-error" eyebrow="Delegación" title="Horas" description="Revisión de horas registradas." />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <DelegacionHorasView horas={result.horas} />;
}
