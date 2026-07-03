import { getApiErrorMessage } from "@/lib/api/errors";
import { requireServerSession } from "@/lib/auth/session.server";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AlumnoInicioView } from "../components/inicio/AlumnoInicioView";
import { getProcesoActual, loadAlumnoInicioDashboard, countNotificacionesNoLeidas } from "../services/inicio.service";
import { listNotificaciones } from "../services/notificaciones.service";
import type { AlumnoInicioStats } from "../services/inicio.service";
import type { HoraResponse } from "../types/alumno.types";

const EMPTY_STATS: AlumnoInicioStats = {
  horasAcumuladas: 0,
  horasRequeridas: null,
  horasRegistradas: 0,
  incidenciasTotales: 0,
  ultimoRegistro: null,
};

export async function AlumnoInicioSection() {
  const result = await requireServerSession()
    .then(async (session) => {
      const procesoActual = await getProcesoActual().catch(() => null);

      let horas: HoraResponse[] = [];
      let stats = EMPTY_STATS;
      const [notificacionesPage, unreadCountResponse] = await Promise.all([
        listNotificaciones({ page: 0, size: 30 }).catch(() => null),
        countNotificacionesNoLeidas().catch(() => null),
      ]);

      if (procesoActual?.idProceso) {
        const dashboard = await loadAlumnoInicioDashboard(procesoActual.idProceso);
        horas = dashboard.horas;
        stats = dashboard.stats;
      }

      return {
        session,
        procesoActual,
        horas,
        stats,
        notificaciones: notificacionesPage?.content ?? [],
        totalNotificaciones: notificacionesPage?.totalElements ?? 0,
        unreadCount: unreadCountResponse?.totalNoLeidas ?? 0,
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
      horas={result.horas}
      stats={result.stats}
      notificaciones={result.notificaciones}
      totalNotificaciones={result.totalNotificaciones}
      unreadCount={result.unreadCount}
    />
  );
}
