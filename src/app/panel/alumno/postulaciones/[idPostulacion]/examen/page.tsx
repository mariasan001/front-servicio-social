import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/errors";
import { AlumnoExamenPostulacionView } from "@/features/alumno/components/examen/AlumnoExamenPostulacionView";
import { getPostulacion } from "@/features/alumno/services/postulaciones.service";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";

export const metadata: Metadata = {
  title: "Examen diagnóstico",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ idPostulacion: string }>;
};

export default async function Page({ params }: PageProps) {
  const { idPostulacion: rawId } = await params;
  const idPostulacion = Number(rawId);

  if (!Number.isFinite(idPostulacion) || idPostulacion <= 0) {
    notFound();
  }

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

  const postulacion = result;
  const postulacionLabel =
    postulacion.vacanteNombre?.trim() ||
    postulacion.folio?.trim() ||
    `#${postulacion.idPostulacion}`;

  return (
    <AlumnoExamenPostulacionView
      idPostulacion={idPostulacion}
      postulacionLabel={postulacionLabel}
    />
  );
}
