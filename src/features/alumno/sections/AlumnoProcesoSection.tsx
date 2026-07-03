import { requireServerSession } from "@/lib/auth/session.server";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import type { AlumnoProcesoSubSlug } from "../constants/proceso-sections";
import { AlumnoProcesoCartasView } from "../components/proceso/AlumnoProcesoCartasView";
import { AlumnoProcesoDocumentosView } from "../components/proceso/AlumnoProcesoDocumentosView";
import { AlumnoProcesoEmptyView } from "../components/proceso/AlumnoProcesoContextBar";
import { AlumnoProcesoHorasView } from "../components/proceso/AlumnoProcesoHorasView";
import { AlumnoProcesoIncidenciasView } from "../components/proceso/AlumnoProcesoIncidenciasView";
import { AlumnoProcesoLayout } from "../components/proceso/AlumnoProcesoLayout";
import { AlumnoProcesoResumenView } from "../components/proceso/AlumnoProcesoResumenView";
import { getProcesoActual } from "../services/inicio.service";
import {
  getProceso,
  getProcesoHorasResumen,
  listProcesoCartas,
  listProcesoDocumentos,
  listProcesoHoras,
  listProcesoIncidencias,
  listProcesos,
} from "../services/proceso.service";
import type { ProcesoDetalleResponse } from "../types/alumno.types";
import pageStyles from "@/shared/styles/PanelSectionView.module.css";
import styles from "../components/proceso/AlumnoProcesoShell.module.css";

async function resolveAlumnoProceso(): Promise<ProcesoDetalleResponse | null> {
  const actual = await getProcesoActual().catch(() => null);
  if (actual?.idProceso) {
    return actual;
  }

  const procesos = await listProcesos();
  const first = procesos[0];
  if (!first) {
    return null;
  }

  return getProceso(first.idProceso);
}

function resolveFirstName(nombreCompleto?: string) {
  return nombreCompleto?.trim().split(/\s+/)[0]?.trim() || nombreCompleto?.trim() || "alumno";
}

type AlumnoProcesoSectionProps = {
  subSection: AlumnoProcesoSubSlug;
};

export async function AlumnoProcesoSection({ subSection }: AlumnoProcesoSectionProps) {
  const sessionResult = await requireServerSession().catch(() => null);
  const firstName = resolveFirstName(sessionResult?.nombreCompleto);

  const result = await resolveAlumnoProceso()
    .then(async (proceso) => {
      if (!proceso) {
        return { proceso: null };
      }

      const idProceso = proceso.idProceso;

      if (subSection === "resumen") {
        const horasResumen = await getProcesoHorasResumen(idProceso).catch(() => null);
        return { proceso, horasResumen };
      }

      if (subSection === "horas") {
        const horas = await listProcesoHoras(idProceso);
        return { proceso, horas };
      }

      if (subSection === "documentos") {
        const documentos = await listProcesoDocumentos(idProceso);
        return { proceso, documentos };
      }

      if (subSection === "cartas") {
        const cartas = await listProcesoCartas(idProceso);
        return { proceso, cartas };
      }

      const incidencias = await listProcesoIncidencias(idProceso);
      return { proceso, incidencias };
    })
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar tu proceso."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="alumno-proceso-error-title">
        <PageHeader
          titleId="alumno-proceso-error-title"
          title="Mi proceso"
          description="Seguimiento de tu servicio social."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  if (!result.proceso) {
    return (
      <section className={pageStyles.page} aria-labelledby="alumno-proceso-title">
        <header className={styles.procesoHeader}>
          <div className={styles.procesoHeaderMain}>
            <div className={styles.procesoHeaderCopy}>
              <h1 id="alumno-proceso-title" className={styles.procesoTitle}>
                <PageGreeting name={firstName} />
              </h1>
              <p className={styles.procesoDescription}>
                Seguimiento de tu servicio social o residencia profesional.
              </p>
            </div>
          </div>
          <hr className={styles.procesoDivider} />
        </header>

        <AlumnoProcesoEmptyView firstName={firstName} />
      </section>
    );
  }

  const proceso = result.proceso;

  switch (subSection) {
    case "resumen":
      return (
        <AlumnoProcesoResumenView
          proceso={proceso}
          horasResumen={result.horasResumen ?? null}
          firstName={firstName}
        />
      );
    case "horas":
      return (
        <AlumnoProcesoHorasView
          proceso={proceso}
          horas={result.horas ?? []}
          firstName={firstName}
        />
      );
    case "documentos":
      return (
        <AlumnoProcesoDocumentosView
          proceso={proceso}
          documentos={result.documentos ?? []}
          firstName={firstName}
        />
      );
    case "cartas":
      return (
        <AlumnoProcesoCartasView
          proceso={proceso}
          cartas={result.cartas ?? []}
          firstName={firstName}
        />
      );
    case "incidencias":
      return (
        <AlumnoProcesoIncidenciasView
          proceso={proceso}
          incidencias={result.incidencias ?? []}
          firstName={firstName}
        />
      );
    default:
      return (
        <AlumnoProcesoLayout
          titleId="alumno-proceso-title"
          firstName={firstName}
          title="Mi proceso"
          description="Seguimiento de tu servicio social o residencia profesional."
          estatus={proceso.estatus}
        >
          <Alert tone="error">No pudimos cargar esta sección del proceso.</Alert>
        </AlumnoProcesoLayout>
      );
  }
}
