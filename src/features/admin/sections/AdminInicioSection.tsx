import { getServerSession } from "@/lib/auth/session.server";
import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import {
  AdminApiSection,
  runAdminProbe,
} from "../components/AdminApiSection/AdminApiSection";
import { getHealth } from "../services/health.service";

export async function AdminInicioSection() {
  const session = await getServerSession();

  const probes = await Promise.all([
    runAdminProbe("Salud del backend", "GET /api/health", () => getHealth()),
    runAdminProbe("Sesión autenticada", "GET /auth/me", async () => session),
  ]);

  return (
    <AdminApiSection
      title="Inicio"
      description="Estado del backend y sesión del administrador autenticado."
      endpoints={ADMIN_SECTION_ENDPOINTS.inicio}
      probes={probes}
    />
  );
}
