import { USER_ROLES } from "@/lib/auth/constants";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminAreasView } from "../components/areas/AdminAreasView";
import { listAreas } from "../services/areas.service";
import { listDependencias } from "../services/dependencias.service";
import { listUsuariosInternos } from "../services/usuarios.service";

async function loadAreasPageData() {
  const [areas, dependencias, titularesDisponibles] = await Promise.all([
    listAreas(),
    listDependencias(),
    listUsuariosInternos({ rol: USER_ROLES.TITULAR_AREA, activo: true }),
  ]);

  return { areas, dependencias, titularesDisponibles };
}

export async function AdminAreasSection() {
  const result = await loadAreasPageData().catch((error: unknown) => ({
    error: getApiErrorMessage(
      error,
      "No pudimos cargar el listado de áreas. Verifica tu conexión e intenta recargar la página.",
    ),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="admin-areas-error-title">
        <PageHeader
          titleId="admin-areas-error-title"
          eyebrow="Administración"
          title="Áreas"
          description="Administra y consulta las áreas receptoras de cada dependencia y las personas titulares asignadas."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return (
    <AdminAreasView
      areas={result.areas}
      dependencias={result.dependencias}
      titularesDisponibles={result.titularesDisponibles}
    />
  );
}
