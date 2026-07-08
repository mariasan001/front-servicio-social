import { Check } from "lucide-react";
import { formatPreguntaTipo, type ExamenPreguntaResponse } from "@/lib/domain";
import styles from "./Examen.module.css";

type ExamenPreguntaPreviewProps = {
  pregunta: ExamenPreguntaResponse;
  index: number;
};

/** Vista previa de una pregunta con enunciado y opciones de respuesta. */
export function ExamenPreguntaPreview({
  pregunta,
  index,
}: ExamenPreguntaPreviewProps) {
  return (
    <article className={styles.preguntaPreview}>
      <header className={styles.preguntaPreviewHead}>
        <span className={styles.preguntaPreviewNumber}>{index + 1}</span>
        <div className={styles.preguntaPreviewInfo}>
          <h4 className={styles.preguntaPreviewTitle}>{pregunta.texto}</h4>
          <p className={styles.preguntaPreviewMeta}>
            {formatPreguntaTipo(pregunta.tipo)}
            {" · "}
            {pregunta.puntaje ?? 1} pts
          </p>
        </div>
      </header>

      <ul className={styles.preguntaOpcionesList}>
        {(pregunta.opciones ?? []).map((opcion) => (
          <li
            key={opcion.idOpcion}
            className={[
              styles.opcionRow,
              opcion.correcta ? styles.opcionRowCorrecta : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles.opcionIndicator} aria-hidden="true">
              {opcion.correcta ? <Check size={12} strokeWidth={3} /> : null}
            </span>
            <span className={styles.opcionText}>{opcion.texto}</span>
            {opcion.correcta ? (
              <span className={styles.opcionCorrectaTag}>Correcta</span>
            ) : null}
          </li>
        ))}
      </ul>
    </article>
  );
}
