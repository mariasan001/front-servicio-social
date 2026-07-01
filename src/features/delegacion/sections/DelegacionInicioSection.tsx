import { getApiErrorMessage } from "@/lib/api/errors";
import { requireServerSession } from "@/lib/auth/session.server";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { DelegacionInicioView } from "../components/inicio/DelegacionInicioView";
import {
  getDashboard,
  listLiberacionesPendientesCarta,
} from "../services/inicio.service";

async function loadDelegacionInicioPageData() {
  const session = await requireServerSession();
  const [dashboard, liberacionesPendientes] = await Promise.all([
    getDashboard(),
    listLiberacionesPendientesCarta(),
  ]);

  return { session, dashboard, liberacionesPendientes };
}

export async function DelegacionInicioSection() {
  const result = await loadDelegacionInicioPageData().catch((error: unknown) => ({
    error: getApiErrorMessage(
      error,
      "No pudimos cargar el resumen operativo. Verifica tu conexión e intenta recargar la página.",
    ),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="delegacion-inicio-error-title">
        <PageHeader
          titleId="delegacion-inicio-error-title"
          eyebrow="Delegación"
          title="Inicio"
          description="Resumen operativo del programa."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return (
    <DelegacionInicioView
      session={result.session}
      dashboard={result.dashboard}
      liberacionesPendientes={result.liberacionesPendientes}
    />
  );
}
