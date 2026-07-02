import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AlumnoNotificacionesView } from "../components/notificaciones/AlumnoNotificacionesView";
import { listNotificaciones } from "../services/notificaciones.service";

export async function AlumnoNotificacionesSection() {
  const result = await listNotificaciones({ page: 0, size: 50 })
    .then((page) => ({
      notificaciones: page?.content ?? [],
      totalElements: page?.totalElements ?? 0,
    }))
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar las notificaciones."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="alumno-notificaciones-error-title">
        <PageHeader
          titleId="alumno-notificaciones-error-title"
          title="Notificaciones"
          description="Avisos y actualizaciones del sistema."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return (
    <AlumnoNotificacionesView
      notificaciones={result.notificaciones}
      totalElements={result.totalElements}
    />
  );
}
