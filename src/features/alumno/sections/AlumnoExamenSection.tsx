import { getApiErrorMessage } from "@/lib/api/errors";
import { AlumnoExamenPostulacionView } from "../components/examen/AlumnoExamenPostulacionView";
import { getPostulacion } from "../services/postulaciones.service";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";

type AlumnoExamenSectionProps = {
  idPostulacion: number;
};

export async function AlumnoExamenSection({ idPostulacion }: AlumnoExamenSectionProps) {
  const result = await getPostulacion(idPostulacion).catch((error: unknown) => ({
    error: getApiErrorMessage(error, "No pudimos cargar tu postulación."),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="alumno-examen-error-title">
        <PageHeader
          titleId="alumno-examen-error-title"
          title="Examen diagnóstico"
          description="No fue posible abrir el examen."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  const postulacionLabel =
    result.vacanteNombre?.trim() ||
    result.folio?.trim() ||
    `#${result.idPostulacion}`;

  return (
    <AlumnoExamenPostulacionView
      idPostulacion={idPostulacion}
      postulacionLabel={postulacionLabel}
    />
  );
}
