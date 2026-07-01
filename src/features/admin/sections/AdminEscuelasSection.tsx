import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AdminEscuelasView } from "../components/escuelas/AdminEscuelasView";
import { listEscuelas } from "../services/escuelas.service";

async function loadEscuelasPageData() {
  const escuelas = await listEscuelas();
  return { escuelas };
}

export async function AdminEscuelasSection() {
  const result = await loadEscuelasPageData().catch((error: unknown) => ({
    error: getApiErrorMessage(
      error,
      "No pudimos cargar el listado de escuelas. Verifica tu conexión e intenta recargar la página.",
    ),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="admin-escuelas-error-title">
        <PageHeader
          titleId="admin-escuelas-error-title"
          eyebrow="Administración"
          title="Escuelas"
          description="Consulta las instituciones educativas participantes y sus invitaciones de registro para alumnos."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <AdminEscuelasView escuelas={result.escuelas} />;
}
