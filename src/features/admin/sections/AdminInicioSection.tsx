import { getServerSession } from "@/lib/auth/session.server";
import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { getHealth } from "../services/health.service";

export async function AdminInicioSection() {
  const session = await getServerSession();

  const probes = await Promise.all([
    runApiProbe("Salud del backend", "GET /api/health", () => getHealth()),
    runApiProbe("Sesión autenticada", "GET /auth/me", async () => session),
  ]);

  return (
    <ApiSection
      sectionId="admin-inicio"
      title="Inicio"
      description="Estado del backend y sesión del administrador autenticado."
      endpoints={ADMIN_SECTION_ENDPOINTS.inicio}
      probes={probes}
    />
  );
}
