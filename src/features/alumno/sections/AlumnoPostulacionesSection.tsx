import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AlumnoPostulacionesView } from "../components/postulaciones/AlumnoPostulacionesView";
import { listPostulaciones } from "../services/postulaciones.service";

export async function AlumnoPostulacionesSection() {
  const result = await listPostulaciones().catch((error: unknown) => ({
    error: getApiErrorMessage(error, "No pudimos cargar tus postulaciones."),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="alumno-postulaciones-error-title">
        <PageHeader
          titleId="alumno-postulaciones-error-title"
          title="Postulaciones"
          description="Consulta el estatus de tus postulaciones."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <AlumnoPostulacionesView postulaciones={result} />;
}
