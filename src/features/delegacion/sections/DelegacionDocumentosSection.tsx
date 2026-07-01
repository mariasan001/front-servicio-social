import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { DELEGACION_SECTION_ENDPOINTS } from "../constants/endpoints";
import { listDocumentosPendientes } from "../services/documentos.service";

export async function DelegacionDocumentosSection() {
  const probes = [
    await runApiProbe(
      "Documentos pendientes de revisión",
      "GET /api/delegacion/documentos/pendientes",
      () => listDocumentosPendientes(),
    ),
  ];

  return (
    <ApiSection
      sectionId="delegacion-documentos"
      title="Documentos"
      description="Validación documental pendiente en procesos activos."
      endpoints={DELEGACION_SECTION_ENDPOINTS.documentos}
      probes={probes}
    />
  );
}
