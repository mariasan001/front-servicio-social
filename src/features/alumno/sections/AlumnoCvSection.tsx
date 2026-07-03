import { getApiErrorMessage } from "@/lib/api/errors";
import { requireServerSession } from "@/lib/auth/session.server";
import { Alert } from "@/shared/components/Alert";
import { PageHeader } from "@/shared/components/PageHeader";
import { AlumnoCvView } from "../components/cv/AlumnoCvView";
import { getCv } from "../services/cv.service";

export async function AlumnoCvSection() {
  const result = await requireServerSession()
    .then(async (session) => {
      const cv = await getCv();
      return { session, cv };
    })
    .catch((error: unknown) => ({
      error: getApiErrorMessage(error, "No pudimos cargar tu CV."),
    }));

  if ("error" in result) {
    return (
      <section aria-labelledby="alumno-cv-error-title">
        <PageHeader
          titleId="alumno-cv-error-title"
          title="Mi CV"
          description="Currículum vitae asociado a tu perfil."
        />
        <Alert tone="error">{result.error}</Alert>
      </section>
    );
  }

  return (
    <AlumnoCvView
      cv={result.cv}
      nombreCompleto={result.session.nombreCompleto}
    />
  );
}
