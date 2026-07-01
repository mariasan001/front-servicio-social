import { ApiSection, runApiProbe } from "@/shared/components/ApiSection";
import { DELEGACION_SECTION_ENDPOINTS } from "../constants/endpoints";
import { listHorasPendientes } from "../services/horas.service";

export async function DelegacionHorasSection() {
  const probes = [
    await runApiProbe(
      "Horas pendientes de validación",
      "GET /api/delegacion/horas/pendientes",
      () => listHorasPendientes(),
    ),
  ];

  return (
    <ApiSection
      sectionId="delegacion-horas"
      title="Horas"
      description="Revisión de horas registradas pendientes de validación."
      endpoints={DELEGACION_SECTION_ENDPOINTS.horas}
      probes={probes}
    />
  );
}
