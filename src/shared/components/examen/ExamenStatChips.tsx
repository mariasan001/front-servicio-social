import {
  formatEtiqueta,
  formatPuntajeMinimo,
  formatTiempoLimite,
} from "@/lib/domain";
import styles from "./Examen.module.css";

type ExamenStatChipsProps = {
  totalPreguntas: number;
  puntajeMinimoAprobatorio?: number | null;
  tiempoLimiteMinutos?: number | null;
  estatus?: string;
};

/** Chips resumen de un examen (preguntas, puntaje mínimo, tiempo y estatus). */
export function ExamenStatChips({
  totalPreguntas,
  puntajeMinimoAprobatorio,
  tiempoLimiteMinutos,
  estatus,
}: ExamenStatChipsProps) {
  return (
    <div className={styles.statChips}>
      <div className={styles.statChip}>
        <span className={styles.statChipLabel}>Preguntas</span>
        <span className={styles.statChipValue}>{totalPreguntas}</span>
      </div>
      <div className={styles.statChip}>
        <span className={styles.statChipLabel}>Puntaje mínimo</span>
        <span className={styles.statChipValue}>
          {formatPuntajeMinimo(puntajeMinimoAprobatorio)}
        </span>
      </div>
      <div className={styles.statChip}>
        <span className={styles.statChipLabel}>Tiempo límite</span>
        <span className={styles.statChipValue}>
          {formatTiempoLimite(tiempoLimiteMinutos)}
        </span>
      </div>
      <div className={styles.statChip}>
        <span className={styles.statChipLabel}>Estatus</span>
        <span className={styles.statChipValue}>
          {formatEtiqueta(estatus, "—")}
        </span>
      </div>
    </div>
  );
}
