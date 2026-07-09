"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { FinalizarExamenResponse } from "@/lib/domain";
import { Button } from "@/shared/components/Button";
import styles from "./AlumnoExamenPostulacionView.module.css";

type AlumnoExamenResultPanelProps = {
  resultado: FinalizarExamenResponse;
  examenTitulo?: string;
  onGoToPostulaciones: () => void;
};

export function AlumnoExamenResultPanel({
  resultado,
  examenTitulo,
  onGoToPostulaciones,
}: AlumnoExamenResultPanelProps) {
  return (
    <div className={styles.resultWrapper}>
      <div className={styles.resultCard}>
        <span
          className={[
            styles.resultIcon,
            resultado.aprobado ? styles.resultIconSuccess : styles.resultIconFail,
          ].join(" ")}
          aria-hidden="true"
        >
          {resultado.aprobado ? (
            <CheckCircle2 size={40} strokeWidth={1.75} />
          ) : (
            <XCircle size={40} strokeWidth={1.75} />
          )}
        </span>

        <div className={styles.resultHead}>
          <h2 className={styles.resultTitle}>
            {resultado.aprobado ? "¡Examen aprobado!" : "Examen finalizado"}
          </h2>
          <p className={styles.resultSubtitle}>{examenTitulo ?? "Examen diagnóstico"}</p>
        </div>

        <dl className={styles.resultMetrics}>
          <div className={styles.resultMetric}>
            <dt>Puntaje</dt>
            <dd>
              {resultado.puntajeObtenido ?? 0} / {resultado.puntajeTotal ?? 0}
            </dd>
          </div>
          <div className={styles.resultMetric}>
            <dt>Porcentaje</dt>
            <dd>{resultado.porcentaje ?? 0}%</dd>
          </div>
          <div className={styles.resultMetric}>
            <dt>Resultado</dt>
            <dd
              className={[
                styles.resultBadge,
                resultado.aprobado ? styles.resultBadgeSuccess : styles.resultBadgeFail,
              ].join(" ")}
            >
              {resultado.aprobado ? "Aprobado" : "No aprobado"}
            </dd>
          </div>
        </dl>

        <p className={styles.resultHint}>
          Tu postulación quedó en estatus <strong>Por evaluar</strong>. El titular revisará tu
          resultado y te notificará la decisión.
        </p>

        <Button type="button" variant="primary" onClick={onGoToPostulaciones}>
          Ir a mis postulaciones
        </Button>
      </div>
    </div>
  );
}
