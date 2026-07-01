import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { getServerSession } from "@/lib/auth/session.server";
import { TITULAR_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getHealth } from "../services/inicio.service";

export async function TitularInicioSection() {
  const session = await getServerSession();

  const probes = await Promise.all([
    runApiProbe("Salud del backend", "GET /api/health", () => getHealth()),
    runApiProbe("Sesión autenticada", "GET /auth/me", async () => session),
  ]);

  return (
    <ApiSection
      sectionId="titular-inicio"
      title="Inicio"
      description="Estado del backend y sesión del titular de área."
      endpoints={TITULAR_SECTION_ENDPOINTS.inicio}
      probes={probes}
    />
  );
}
