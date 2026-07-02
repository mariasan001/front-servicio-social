import { getApiErrorMessage } from "@/lib/api/errors";
import { requireServerSession } from "@/lib/auth/session.server";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AlumnoInicioView } from "../components/inicio/AlumnoInicioView";
import {
  countNotificacionesNoLeidas,
  getProcesoActual,
} from "../services/inicio.service";
import { listPostulaciones } from "../services/postulaciones.service";
import { listVacantes } from "../services/vacantes.service";

export async function AlumnoInicioSection() {
  const result = await requireServerSession()
    .then(async (session) => {
      const [procesoActual, notificacionesCount, vacantes, postulaciones] = await Promise.all([
        getProcesoActual().catch(() => null),
        countNotificacionesNoLeidas().then((data) => data?.totalNoLeidas ?? 0),
        listVacantes(),
        listPostulaciones(),
      ]);

      return {
        session,
        procesoActual,
        notificacionesNoLeidas: notificacionesCount,
        stats: {
          vacantes: vacantes.length,
          postulaciones: postulaciones.length,
        },
      };
    })
    .catch((error: unknown) => ({
      error: getApiErrorMessage(
        error,
        "No pudimos cargar el resumen. Verifica tu conexión e intenta recargar la página.",
      ),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="alumno-inicio-error-title">
        <PageHeader
          titleId="alumno-inicio-error-title"
          title="Inicio"
          description="Resumen de tu participación."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return (
    <AlumnoInicioView
      session={result.session}
      procesoActual={result.procesoActual}
      notificacionesNoLeidas={result.notificacionesNoLeidas}
      stats={result.stats}
    />
  );
}
