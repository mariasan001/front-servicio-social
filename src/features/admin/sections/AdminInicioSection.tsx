import { getApiErrorMessage } from "@/lib/api/errors";
import { requireServerSession } from "@/lib/auth/session.server";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminInicioView } from "../components/inicio/AdminInicioView";
import { listAreas } from "../services/areas.service";
import { listDependencias } from "../services/dependencias.service";
import { listEscuelas } from "../services/escuelas.service";
import { listUsuariosInternos } from "../services/usuarios.service";

function countActivas<T extends { activa?: boolean }>(items: T[]) {
  return items.filter((item) => item.activa !== false).length;
}

function countEscuelasActivas(
  escuelas: { estatus?: string }[],
) {
  return escuelas.filter(
    (escuela) => escuela.estatus?.trim().toUpperCase() === "ACTIVA",
  ).length;
}

function countUsuariosActivos(
  usuarios: { activo?: boolean }[],
) {
  return usuarios.filter((usuario) => usuario.activo !== false).length;
}

async function loadAdminInicioPageData() {
  const session = await requireServerSession();
  const [dependencias, areas, escuelas, usuarios] = await Promise.all([
    listDependencias(),
    listAreas(),
    listEscuelas(),
    listUsuariosInternos(),
  ]);

  return {
    session,
    stats: {
      dependencias: {
        total: dependencias.length,
        activas: countActivas(dependencias),
      },
      areas: {
        total: areas.length,
        activas: countActivas(areas),
      },
      escuelas: {
        total: escuelas.length,
        activas: countEscuelasActivas(escuelas),
      },
      usuarios: {
        total: usuarios.length,
        activos: countUsuariosActivos(usuarios),
      },
    },
  };
}

export async function AdminInicioSection() {
  const result = await loadAdminInicioPageData().catch((error: unknown) => ({
    error: getApiErrorMessage(
      error,
      "No pudimos cargar el resumen de administración. Verifica tu conexión e intenta recargar la página.",
    ),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="admin-inicio-error-title">
        <PageHeader
          titleId="admin-inicio-error-title"
          eyebrow="Administración"
          title="Inicio"
          description="Resumen del sistema y accesos rápidos a las secciones de administración."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <AdminInicioView session={result.session} stats={result.stats} />;
}
