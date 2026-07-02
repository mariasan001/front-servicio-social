import { getApiErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AlumnoCvView } from "../components/cv/AlumnoCvView";
import { getCv } from "../services/cv.service";

export async function AlumnoCvSection() {
  const result = await getCv().catch((error: unknown) => ({
    error: getApiErrorMessage(error, "No pudimos cargar tu CV."),
  }));

  if ("error" in result) {
    return (
      <section aria-labelledby="alumno-cv-error-title">
        <PageHeader
          titleId="alumno-cv-error-title"
          eyebrow="Alumno"
          title="Mi CV"
          description="Currículum vitae asociado a tu perfil."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return <AlumnoCvView cv={result} />;
}
