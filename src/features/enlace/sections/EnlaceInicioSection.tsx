import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { getServerSession } from "@/lib/auth/session.server";
import { ENLACE_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getDashboardResumen, getHealth } from "../services/inicio.service";

export async function EnlaceInicioSection() {
  const session = await getServerSession();

  const probes = await Promise.all([
    runApiProbe("Salud del backend", "GET /api/health", () => getHealth()),
    runApiProbe("Sesión autenticada", "GET /auth/me", async () => session),
    runApiProbe(
      "Resumen institucional",
      "GET /api/enlace/dashboard/resumen",
      () => getDashboardResumen(),
    ),
  ]);

  return (
    <ApiSection
      sectionId="enlace-inicio"
      title="Inicio"
      description="Resumen de alumnos vinculados y estado operativo de la escuela."
      endpoints={ENLACE_SECTION_ENDPOINTS.inicio}
      probes={probes}
    />
  );
}
