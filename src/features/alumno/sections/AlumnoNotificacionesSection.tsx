import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { ALUMNO_SECTION_ENDPOINTS } from "../constants/endpoints";
import { listNotificaciones } from "../services/notificaciones.service";

export async function AlumnoNotificacionesSection() {
  const probes = await Promise.all([
    runApiProbe("Listado de notificaciones", "GET /api/notificaciones", () =>
      listNotificaciones({ page: 0, size: 5 }),
    ),
  ]);

  return (
    <ApiSection
      sectionId="alumno-notificaciones"
      title="Notificaciones"
      description="Avisos y actualizaciones del sistema dirigidos a tu cuenta."
      endpoints={ALUMNO_SECTION_ENDPOINTS.notificaciones}
      probes={probes}
    />
  );
}
