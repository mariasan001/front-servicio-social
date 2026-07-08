import {
  formatPuntajeMinimo,
  formatTiempoLimite,
  type ExamenDiagnosticoDetalleResponse,
} from "@/lib/domain";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "./Examen.module.css";

type ExamenOverviewProps = {
  examen: Pick<
    ExamenDiagnosticoDetalleResponse,
    | "estatus"
    | "puntajeMinimoAprobatorio"
    | "tiempoLimiteMinutos"
    | "areaNombre"
  >;
  totalPreguntas: number;
  puntajeTotal?: number;
  showArea?: boolean;
};

/** Resumen compacto del examen (estatus, área y métricas clave). */
export function ExamenOverview({
  examen,
  totalPreguntas,
  puntajeTotal,
  showArea = false,
}: ExamenOverviewProps) {
  return (
    <section className={styles.overview} aria-label="Resumen del examen">
      <div className={styles.overviewHead}>
        <div className={styles.overviewHeadMain}>
          <span className={styles.overviewEyebrow}>Examen diagnóstico</span>
          {showArea && examen.areaNombre ? (
            <span className={styles.overviewArea}>{examen.areaNombre}</span>
          ) : null}
        </div>
        <EstatusBadge estatus={examen.estatus} />
      </div>

      <div className={styles.overviewMetrics}>
        <div className={styles.overviewMetric}>
          <span className={styles.overviewMetricLabel}>Preguntas</span>
          <span className={styles.overviewMetricValue}>{totalPreguntas}</span>
        </div>
        <div className={styles.overviewMetricDivider} aria-hidden="true" />
        <div className={styles.overviewMetric}>
          <span className={styles.overviewMetricLabel}>Puntaje mínimo</span>
          <span className={styles.overviewMetricValue}>
            {formatPuntajeMinimo(examen.puntajeMinimoAprobatorio)}
          </span>
        </div>
        <div className={styles.overviewMetricDivider} aria-hidden="true" />
        <div className={styles.overviewMetric}>
          <span className={styles.overviewMetricLabel}>Tiempo límite</span>
          <span className={styles.overviewMetricValue}>
            {formatTiempoLimite(examen.tiempoLimiteMinutos)}
          </span>
        </div>
        {puntajeTotal !== undefined ? (
          <>
            <div className={styles.overviewMetricDivider} aria-hidden="true" />
            <div className={styles.overviewMetric}>
              <span className={styles.overviewMetricLabel}>Puntaje total</span>
              <span className={styles.overviewMetricValue}>{puntajeTotal} pts</span>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
