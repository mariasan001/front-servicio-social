import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import type { EscuelaResponse } from "../types/escuela.types";
import {
  AdminApiSection,
  runAdminProbe,
} from "../components/AdminApiSection/AdminApiSection";
import {
  getEscuela,
  listEscuelaTokens,
  listEscuelas,
} from "../services/escuelas.service";

export async function AdminEscuelasSection() {
  const listProbe = await runAdminProbe("Listado de escuelas", "GET /api/escuelas", () =>
    listEscuelas(),
  );

  const probes = [listProbe];
  const firstId = listProbe.ok
    ? (listProbe.data as EscuelaResponse[] | undefined)?.[0]?.idEscuela
    : undefined;

  if (firstId) {
    probes.push(
      await runAdminProbe(
        `Detalle escuela #${firstId}`,
        `GET /api/escuelas/${firstId}`,
        () => getEscuela(firstId),
      ),
      await runAdminProbe(
        `Tokens escuela #${firstId}`,
        `GET /api/escuelas/${firstId}/tokens`,
        () => listEscuelaTokens(firstId),
      ),
    );
  }

  return (
    <AdminApiSection
      title="Escuelas"
      description="Instituciones educativas y tokens de registro."
      endpoints={ADMIN_SECTION_ENDPOINTS.escuelas}
      probes={probes}
    />
  );
}
