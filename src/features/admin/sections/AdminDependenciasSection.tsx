import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import type { DependenciaResponse } from "../types/dependencia.types";
import {
  AdminApiSection,
  runAdminProbe,
} from "../components/AdminApiSection/AdminApiSection";
import {
  getDependencia,
  listDependencias,
} from "../services/dependencias.service";

export async function AdminDependenciasSection() {
  const listProbe = await runAdminProbe(
    "Listado de dependencias",
    "GET /api/dependencias",
    () => listDependencias(),
  );

  const probes = [listProbe];
  const firstId = listProbe.ok
    ? (listProbe.data as DependenciaResponse[] | undefined)?.[0]?.idDependencia
    : undefined;

  if (firstId) {
    probes.push(
      await runAdminProbe(
        `Detalle dependencia #${firstId}`,
        `GET /api/dependencias/${firstId}`,
        () => getDependencia(firstId),
      ),
    );
  }

  return (
    <AdminApiSection
      title="Dependencias"
      description="Catálogo de dependencias receptoras."
      endpoints={ADMIN_SECTION_ENDPOINTS.dependencias}
      probes={probes}
    />
  );
}
