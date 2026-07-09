import { CheckCircle2, Circle } from "lucide-react";
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
  const opciones = pregunta.opciones ?? [];

  return (
    <article className={styles.preguntaPreview}>
      <header className={styles.preguntaPreviewHeader}>
        <span className={styles.preguntaPreviewBadge}>Pregunta {index + 1}</span>
        <span className={styles.preguntaPreviewMeta}>
          {formatPreguntaTipo(pregunta.tipo)} · {pregunta.puntaje ?? 1} pts
        </span>
      </header>

      <p className={styles.preguntaPreviewEnunciado}>{pregunta.texto}</p>

      <ul className={styles.preguntaOpciones} aria-label="Opciones de respuesta">
        {opciones.map((opcion, opcionIndex) => {
          const isCorrect = Boolean(opcion.correcta);

          return (
            <li
              key={opcion.idOpcion}
              className={isCorrect ? styles.opcionCorrecta : styles.opcionNormal}
            >
              <span className={styles.opcionMarker} aria-hidden="true">
                {String.fromCharCode(65 + opcionIndex)}
              </span>
              <span className={styles.opcionTexto}>{opcion.texto}</span>
              {isCorrect ? (
                <CheckCircle2
                  size={18}
                  strokeWidth={2}
                  className={styles.opcionCheck}
                  aria-label="Respuesta correcta"
                />
              ) : (
                <Circle size={18} strokeWidth={1.75} className={styles.opcionRadio} aria-hidden />
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
