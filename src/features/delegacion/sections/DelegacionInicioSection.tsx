import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { getServerSession } from "@/lib/auth/session.server";
import { DELEGACION_SECTION_ENDPOINTS } from "../constants/endpoints";
import {
  getDashboard,
  getHealth,
  listLiberacionesPendientesCarta,
  listNotificacionesCorreos,
} from "../services/inicio.service";

export async function DelegacionInicioSection() {
  const session = await getServerSession();

  const probes = await Promise.all([
    runApiProbe("Salud del backend", "GET /api/health", () => getHealth()),
    runApiProbe("Sesión autenticada", "GET /auth/me", async () => session),
    runApiProbe("Dashboard operativo", "GET /api/delegacion/reportes/dashboard", () =>
      getDashboard(),
    ),
    runApiProbe(
      "Liberaciones pendientes de carta",
      "GET /api/delegacion/liberaciones-tecnicas/pendientes-carta",
      () => listLiberacionesPendientesCarta(),
    ),
    runApiProbe(
      "Notificaciones por correo",
      "GET /api/delegacion/notificaciones/correos",
      () => listNotificacionesCorreos({ page: 0, size: 5 }),
    ),
  ]);

  return (
    <ApiSection
      sectionId="delegacion-inicio"
      title="Inicio"
      description="Resumen operativo del programa y estado de la sesión de delegación."
      endpoints={DELEGACION_SECTION_ENDPOINTS.inicio}
      probes={probes}
    />
  );
}
