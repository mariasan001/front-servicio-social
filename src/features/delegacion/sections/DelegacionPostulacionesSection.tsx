import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionPostulacionesView } from "../components/postulaciones/DelegacionPostulacionesView";
import { listPostulaciones } from "../services/postulaciones.service";

export async function DelegacionPostulacionesSection() {
  const result = await listPostulaciones()
    .then((postulaciones) => ({ postulaciones }))
    .catch((error: unknown) => ({ error: getApiErrorMessage(error, "No pudimos cargar las postulaciones.") }));

  if ("error" in result) {
    return (
      <section>
        <PageHeader titleId="delegacion-post-error" title="Postulaciones" description="Seguimiento de postulaciones." />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <DelegacionPostulacionesView postulaciones={result.postulaciones} />;
}
