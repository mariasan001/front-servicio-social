import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { TitularIncidenciasView } from "../components/incidencias/TitularIncidenciasView";
import { TitularProcesosView } from "../components/procesos/TitularProcesosView";
import { TitularSeguimientoLayout } from "../components/seguimiento/TitularSeguimientoLayout";
import type { TitularSeguimientoTab } from "../constants/seguimiento-sections";
import { listIncidencias } from "../services/incidencias.service";
import { listProcesos } from "../services/procesos.service";
import { enrichIncidenciasWithAlumnos } from "../lib/enrich-incidencias";

type TitularSeguimientoSectionProps = {
  activeTab: TitularSeguimientoTab;
};

export async function TitularSeguimientoSection({ activeTab }: TitularSeguimientoSectionProps) {
  const [procesosResult, incidenciasResult] = await Promise.all([
    listProcesos()
      .then((procesos) => ({ procesos }))
      .catch((error: unknown) => ({
        error: getApiErrorMessage(error, "No pudimos cargar los alumnos en proceso."),
      })),
    listIncidencias()
      .then((incidencias) => ({ incidencias }))
      .catch((error: unknown) => ({
        error: getApiErrorMessage(error, "No pudimos cargar la bandeja de incidencias."),
      })),
  ]);

  if (activeTab === "alumnos" && "error" in procesosResult) {
    return (
      <section aria-labelledby="titular-seguimiento-error-title">
        <PageHeader
          titleId="titular-seguimiento-error-title"
          title="Alumnos"
          description="Seguimiento de alumnos en servicio."
        />
        <Alert tone="error">{procesosResult.error}</Alert>
      </section>
    );
  }

  if (activeTab === "incidencias" && "error" in incidenciasResult) {
    return (
      <TitularSeguimientoLayout activeTab={activeTab}>
        <Alert tone="error">{incidenciasResult.error}</Alert>
      </TitularSeguimientoLayout>
    );
  }

  return (
    <TitularSeguimientoLayout activeTab={activeTab}>
      {activeTab === "incidencias" ? (
        <TitularIncidenciasView
          incidencias={enrichIncidenciasWithAlumnos(
            "incidencias" in incidenciasResult ? incidenciasResult.incidencias : [],
            "procesos" in procesosResult ? procesosResult.procesos : [],
          )}
          embedded
        />
      ) : (
        <TitularProcesosView
          procesos={"procesos" in procesosResult ? procesosResult.procesos : []}
          embedded
        />
      )}
    </TitularSeguimientoLayout>
  );
}
