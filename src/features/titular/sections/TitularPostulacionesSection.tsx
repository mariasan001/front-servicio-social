import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { TitularPostulacionesView } from "../components/postulaciones/TitularPostulacionesView";
import { listPostulaciones } from "../services/postulaciones.service";

export async function TitularPostulacionesSection() {
  const result = await listPostulaciones()
    .then((postulaciones) => ({ postulaciones }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar las postulaciones."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="titular-postulaciones-error-title">
        <PageHeader
          titleId="titular-postulaciones-error-title"
          title="Postulaciones"
          description="Seguimiento de postulaciones."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <TitularPostulacionesView postulaciones={result.postulaciones} />;
}
