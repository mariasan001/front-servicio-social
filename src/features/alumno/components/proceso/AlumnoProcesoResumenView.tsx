import type { HorasResumenResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import { AlumnoEncuestaSatisfaccionModal } from "./AlumnoEncuestaSatisfaccionModal";
import { AlumnoProcesoContextBar } from "./AlumnoProcesoContextBar";
import { AlumnoProcesoLayout } from "./AlumnoProcesoLayout";

type AlumnoProcesoResumenViewProps = {
  proceso: ProcesoDetalleResponse;
  horasResumen: HorasResumenResponse | null;
  firstName: string;
  alumnoNombre?: string;
};

export function AlumnoProcesoResumenView({
  proceso,
  horasResumen,
  firstName,
  alumnoNombre,
}: AlumnoProcesoResumenViewProps) {
  return (
    <AlumnoProcesoLayout
      titleId="alumno-proceso-title"
      firstName={firstName}
      title="Mi proceso"
      description="Consulta el avance de tu servicio social."
      estatus={proceso.estatus}
    >
      <AlumnoProcesoContextBar
        proceso={proceso}
        horasResumen={horasResumen}
        showMetrics
      />

      <AlumnoEncuestaSatisfaccionModal
        idProceso={proceso.idProceso}
        estatus={proceso.estatus}
        alumnoNombre={alumnoNombre}
        escuelaDefault={proceso.dependenciaNombre}
      />
    </AlumnoProcesoLayout>
  );
}
