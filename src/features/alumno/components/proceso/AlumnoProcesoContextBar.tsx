import Link from "next/link";
import { FileText } from "lucide-react";
import type { HorasResumenResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import styles from "./AlumnoProcesoShell.module.css";

type AlumnoProcesoContextBarProps = {
  proceso: ProcesoDetalleResponse;
  horasResumen?: HorasResumenResponse | null;
  showMetrics?: boolean;
};

export function AlumnoProcesoContextBar({
  proceso,
  horasResumen,
  showMetrics = false,
}: AlumnoProcesoContextBarProps) {
  const vacanteNombre = proceso.vacanteNombre?.trim();
  const folio = proceso.folio?.trim();

  return (
    <div className={detailStyles.modalBody}>
      <DetailModalHero
        icon={FileText}
        title={vacanteNombre || "Sin vacante asignada"}
        subtitle={folio || `#${proceso.idProceso}`}
        badges={<EstatusBadge estatus={proceso.estatus} />}
      />

      <dl className={detailStyles.metaList}>
        <div className={detailStyles.metaRow}>
          <dt>Área</dt>
          <dd>{proceso.areaNombre?.trim() || "Sin área"}</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Dependencia</dt>
          <dd>{proceso.dependenciaNombre?.trim() || "Sin dependencia"}</dd>
        </div>
        <div className={detailStyles.metaRow}>
          <dt>Titular</dt>
          <dd>{proceso.titularNombre?.trim() || "Sin titular"}</dd>
        </div>
      </dl>

      {showMetrics && horasResumen ? (
        <dl className={styles.metricsRow}>
          <div className={styles.metricItem}>
            <dt>Horas acumuladas</dt>
            <dd>{horasResumen.horasAcumuladas ?? 0}</dd>
          </div>
          <div className={styles.metricItem}>
            <dt>Horas requeridas</dt>
            <dd>{horasResumen.horasRequeridas ?? "—"}</dd>
          </div>
          <div className={styles.metricItem}>
            <dt>Avance</dt>
            <dd>
              {horasResumen.porcentajeAvance !== undefined &&
              horasResumen.porcentajeAvance !== null
                ? `${horasResumen.porcentajeAvance}%`
                : "—"}
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}

type AlumnoProcesoEmptyViewProps = {
  firstName: string;
};

export function AlumnoProcesoEmptyView({ firstName }: AlumnoProcesoEmptyViewProps) {
  return (
    <div className={styles.emptyState}>
      <p>
        Hola, <strong>{firstName}</strong>. Aún no tienes un proceso activo. Cuando tu postulación
        sea aceptada, aquí podrás registrar horas, subir documentos y consultar tu avance.
      </p>
      <p>
        <Link href={`${PANEL_PATHS.alumno}/vacantes`}>Explora las vacantes disponibles</Link> para postularte.
      </p>
    </div>
  );
}
