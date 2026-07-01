import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { ALUMNO_SECTION_ENDPOINTS } from "../constants/endpoints";
import { getCv } from "../services/cv.service";

export async function AlumnoCvSection() {
  const probes = await Promise.all([
    runApiProbe("Mi CV", "GET /api/alumno/cv", () => getCv()),
  ]);

  return (
    <ApiSection
      sectionId="alumno-cv"
      title="Mi CV"
      description="Currículum vitae asociado a tu perfil de alumno."
      endpoints={ALUMNO_SECTION_ENDPOINTS.cv}
      probes={probes}
    />
  );
}
