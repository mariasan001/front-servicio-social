import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { DelegacionDocumentosView } from "../components/documentos/DelegacionDocumentosView";
import { DelegacionHorasView } from "../components/horas/DelegacionHorasView";
import { DelegacionIncidenciasView } from "../components/incidencias/DelegacionIncidenciasView";
import { DelegacionValidacionLayout } from "../components/validacion/DelegacionValidacionLayout";
import {
  getDelegacionValidacionSubSection,
  type DelegacionValidacionSubSlug,
} from "../constants/validacion-sections";
import { listDocumentosPendientes } from "../services/documentos.service";
import { listHorasPendientes } from "../services/horas.service";
import { listIncidencias } from "../services/incidencias.service";

type DelegacionValidacionSectionProps = {
  subSection: DelegacionValidacionSubSlug;
};

export async function DelegacionValidacionSection({
  subSection,
}: DelegacionValidacionSectionProps) {
  const section = getDelegacionValidacionSubSection(subSection);
  const description =
    section?.description ??
    "Revisa documentos, horas e incidencias enviadas por los alumnos.";

  switch (subSection) {
    case "documentos": {
      const result = await listDocumentosPendientes()
        .then((documentos) => ({ documentos }))
        .catch((error: unknown) => ({
          error: getApiErrorMessage(error, "No pudimos cargar los documentos pendientes."),
        }));

      return (
        <DelegacionValidacionLayout
          titleId="delegacion-validacion-title"
          description={description}
        >
          {"error" in result ? (
            <Alert tone="error">{result.error}</Alert>
          ) : (
            <DelegacionDocumentosView documentos={result.documentos} />
          )}
        </DelegacionValidacionLayout>
      );
    }
    case "horas": {
      const result = await listHorasPendientes()
        .then((horas) => ({ horas }))
        .catch((error: unknown) => ({
          error: getApiErrorMessage(error, "No pudimos cargar las horas pendientes."),
        }));

      return (
        <DelegacionValidacionLayout
          titleId="delegacion-validacion-title"
          description={description}
        >
          {"error" in result ? (
            <Alert tone="error">{result.error}</Alert>
          ) : (
            <DelegacionHorasView horas={result.horas} />
          )}
        </DelegacionValidacionLayout>
      );
    }
    case "incidencias": {
      const result = await listIncidencias()
        .then((incidencias) => ({ incidencias }))
        .catch((error: unknown) => ({
          error: getApiErrorMessage(error, "No pudimos cargar las incidencias."),
        }));

      return (
        <DelegacionValidacionLayout
          titleId="delegacion-validacion-title"
          description={description}
        >
          {"error" in result ? (
            <Alert tone="error">{result.error}</Alert>
          ) : (
            <DelegacionIncidenciasView incidencias={result.incidencias} />
          )}
        </DelegacionValidacionLayout>
      );
    }
  }
}
