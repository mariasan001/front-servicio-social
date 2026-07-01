import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminUsuariosView } from "../components/usuarios/AdminUsuariosView";
import { listEscuelas } from "../services/escuelas.service";
import { listUsuariosInternos } from "../services/usuarios.service";

async function loadUsuariosPageData() {
  const [usuarios, escuelas] = await Promise.all([
    listUsuariosInternos(),
    listEscuelas(),
  ]);

  return { usuarios, escuelas };
}

export async function AdminUsuariosSection() {
  const result = await loadUsuariosPageData().catch((error: unknown) => ({
    error: getApiErrorMessage(
      error,
      "No pudimos cargar el listado de usuarios. Verifica tu conexión e intenta recargar la página.",
    ),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="admin-usuarios-error-title">
        <PageHeader
          titleId="admin-usuarios-error-title"
          eyebrow="Administración"
          title="Usuarios internos"
          description="Administra y consulta las cuentas del personal que opera el programa y los perfiles que tienen asignados."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <AdminUsuariosView usuarios={result.usuarios} escuelas={result.escuelas} />;
}
