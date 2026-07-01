import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { getServerSession } from "@/lib/auth/session.server";
import { ALUMNO_SECTION_ENDPOINTS } from "../constants/endpoints";
import {
  countNotificacionesNoLeidas,
  getHealth,
  getProcesoActual,
} from "../services/inicio.service";

export async function AlumnoInicioSection() {
  const session = await getServerSession();

  const probes = await Promise.all([
    runApiProbe("Salud del backend", "GET /api/health", () => getHealth()),
    runApiProbe("Sesión autenticada", "GET /auth/me", async () => session),
    runApiProbe(
      "Proceso actual",
      "GET /api/alumno/procesos/actual",
      () => getProcesoActual(),
    ),
    runApiProbe(
      "Notificaciones no leídas",
      "GET /api/notificaciones/no-leidas/count",
      () => countNotificacionesNoLeidas(),
    ),
  ]);

  return (
    <ApiSection
      sectionId="alumno-inicio"
      title="Inicio"
      description="Resumen de tu participación, proceso activo y avisos pendientes."
      endpoints={ALUMNO_SECTION_ENDPOINTS.inicio}
      probes={probes}
    />
  );
}
