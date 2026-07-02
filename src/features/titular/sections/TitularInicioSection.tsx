import { getApiErrorMessage } from "@/lib/api/errors";
import { requireServerSession } from "@/lib/auth/session.server";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { TitularInicioView } from "../components/inicio/TitularInicioView";
import { listIncidencias } from "../services/incidencias.service";
import { listPostulaciones } from "../services/postulaciones.service";
import { listProcesos } from "../services/procesos.service";
import { listVacantes } from "../services/vacantes.service";

export async function TitularInicioSection() {
  const result = await requireServerSession()
    .then(async (session) => {
      const [vacantes, postulaciones, procesos, incidencias] = await Promise.all([
        listVacantes(),
        listPostulaciones(),
        listProcesos(),
        listIncidencias(),
      ]);

      return {
        session,
        stats: {
          vacantes: vacantes.length,
          postulaciones: postulaciones.length,
          procesos: procesos.length,
          incidencias: incidencias.length,
        },
      };
    })
    .catch((error: unknown) => ({
      error: getApiErrorMessage(
        error,
        "No pudimos cargar el resumen. Verifica tu conexión e intenta recargar la página.",
      ),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="titular-inicio-error-title">
        <PageHeader
          titleId="titular-inicio-error-title"
          title="Inicio"
          description="Resumen de tu área."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <TitularInicioView session={result.session} stats={result.stats} />;
}
