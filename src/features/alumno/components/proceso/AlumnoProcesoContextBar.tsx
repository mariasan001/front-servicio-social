import Link from "next/link";
import { FileText } from "lucide-react";
import type { HorasResumenResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { formatEtiqueta } from "@/lib/domain";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import entityStyles from "@/shared/styles/EntityDetailModal.module.css";
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
    <div className={entityStyles.layout}>
      <div className={entityStyles.summaryBar}>
        <div className={entityStyles.avatar} aria-hidden="true">
          <FileText size={18} strokeWidth={1.75} />
        </div>

        <div className={entityStyles.summaryMeta}>
          <p className={entityStyles.summaryPrimary}>
            {vacanteNombre || "Sin vacante asignada"}
          </p>
          <p className={entityStyles.summarySecondary}>{folio || `#${proceso.idProceso}`}</p>
        </div>

        <EstatusBadge estatus={proceso.estatus} />
      </div>

      <div className={entityStyles.infoPanel}>
        <dl className={entityStyles.infoGrid}>
          <div className={entityStyles.infoItem}>
            <dt>Vacante</dt>
            <dd>{vacanteNombre || "Sin vacante"}</dd>
          </div>
          <div className={entityStyles.infoItem}>
            <dt>Área</dt>
            <dd>{proceso.areaNombre?.trim() || "Sin área"}</dd>
          </div>
          <div className={entityStyles.infoItem}>
            <dt>Dependencia</dt>
            <dd>{proceso.dependenciaNombre?.trim() || "Sin dependencia"}</dd>
          </div>
          <div className={entityStyles.infoItem}>
            <dt>Titular</dt>
            <dd>{proceso.titularNombre?.trim() || "Sin titular"}</dd>
          </div>
          <div className={entityStyles.infoItem}>
            <dt>Estatus</dt>
            <dd>{formatEtiqueta(proceso.estatus)}</dd>
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
