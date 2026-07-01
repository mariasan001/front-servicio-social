import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminDependenciasView } from "../components/dependencias/AdminDependenciasView";
import { listDependencias } from "../services/dependencias.service";

async function loadDependenciasPageData() {
  const dependencias = await listDependencias();
  return { dependencias };
}

export async function AdminDependenciasSection() {
  const result = await loadDependenciasPageData().catch((error: unknown) => ({
    error: getApiErrorMessage(
      error,
      "No pudimos cargar el listado de dependencias. Verifica tu conexión e intenta recargar la página.",
    ),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="admin-dependencias-error-title">
        <PageHeader
          titleId="admin-dependencias-error-title"
          eyebrow="Administración"
          title="Dependencias"
          description="Consulta las dependencias receptoras que participan en el programa de servicio social y residencia."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <AdminDependenciasView dependencias={result.dependencias} />;
}
