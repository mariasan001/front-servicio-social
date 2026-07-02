import { getApiErrorMessage } from "@/lib/api/errors";
import { requireServerSession } from "@/lib/auth/session.server";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { EnlaceInicioView } from "../components/inicio/EnlaceInicioView";
import { getDashboardResumen } from "../services/inicio.service";

export async function EnlaceInicioSection() {
  const result = await requireServerSession()
    .then(async (session) => {
      const resumen = await getDashboardResumen();
      return { session, resumen };
    })
    .catch((error: unknown) => ({
      error: getApiErrorMessage(
        error,
        "No pudimos cargar el resumen. Verifica tu conexión e intenta recargar la página.",
      ),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="enlace-inicio-error-title">
        <PageHeader
          titleId="enlace-inicio-error-title"
          title="Inicio"
          description="Resumen de alumnos y procesos de tu escuela."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <EnlaceInicioView session={result.session} resumen={result.resumen} />;
}
