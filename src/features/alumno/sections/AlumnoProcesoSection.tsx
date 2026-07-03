import { requireServerSession } from "@/lib/auth/session.server";
import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AlumnoProcesoView } from "../components/proceso/AlumnoProcesoView";
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

export async function AlumnoProcesoSection() {
  const sessionResult = await requireServerSession().catch(() => null);

  const result = await resolveAlumnoProceso()
    .then(async (proceso) => {
      if (!proceso) {
        return {
          proceso: null,
          horasResumen: null,
          horas: [],
          documentos: [],
          cartas: [],
          incidencias: [],
        };
      }

      const idProceso = proceso.idProceso;
      const [horasResumen, horas, documentos, cartas, incidencias] = await Promise.all([
        getProcesoHorasResumen(idProceso).catch(() => null),
        listProcesoHoras(idProceso),
        listProcesoDocumentos(idProceso),
        listProcesoCartas(idProceso),
        listProcesoIncidencias(idProceso),
      ]);

      return { proceso, horasResumen, horas, documentos, cartas, incidencias };
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

  return (
    <AlumnoProcesoView
      proceso={result.proceso}
      horasResumen={result.horasResumen}
      horas={result.horas}
      documentos={result.documentos}
      cartas={result.cartas}
      incidencias={result.incidencias}
      nombreCompleto={sessionResult?.nombreCompleto}
    />
  );
}
