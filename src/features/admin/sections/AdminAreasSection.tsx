import { ADMIN_SECTION_ENDPOINTS } from "../constants/endpoints";
import type { AreaResponse } from "../types/area.types";
import {
  AdminApiSection,
  runAdminProbe,
} from "../components/AdminApiSection/AdminApiSection";
import {
  getArea,
  listAreaTitulares,
  listAreas,
} from "../services/areas.service";

export async function AdminAreasSection() {
  const listProbe = await runAdminProbe("Listado de áreas", "GET /api/areas", () =>
    listAreas(),
  );

  const probes = [listProbe];
  const firstId = listProbe.ok
    ? (listProbe.data as AreaResponse[] | undefined)?.[0]?.idArea
    : undefined;

  if (firstId) {
    probes.push(
      await runAdminProbe(
        `Detalle área #${firstId}`,
        `GET /api/areas/${firstId}`,
        () => getArea(firstId),
      ),
      await runAdminProbe(
        `Titulares área #${firstId}`,
        `GET /api/areas/${firstId}/titulares`,
        () => listAreaTitulares(firstId),
      ),
    );
  }

  return (
    <AdminApiSection
      title="Áreas"
      description="Áreas receptoras y titulares asignados."
      endpoints={ADMIN_SECTION_ENDPOINTS.areas}
      probes={probes}
    />
  );
}
