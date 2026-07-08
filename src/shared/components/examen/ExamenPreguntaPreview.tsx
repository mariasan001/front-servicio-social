import { formatPreguntaTipo, type ExamenPreguntaResponse } from "@/lib/domain";
import styles from "./Examen.module.css";

type ExamenPreguntaPreviewProps = {
  pregunta: ExamenPreguntaResponse;
  index: number;
};

/** Tarjeta de solo lectura con el enunciado, tipo, puntaje y opciones. */
export function ExamenPreguntaPreview({
  pregunta,
  index,
}: ExamenPreguntaPreviewProps) {
  return (
    <div className={styles.preguntaCard}>
      <div className={styles.preguntaCardHead}>
        <span className={styles.preguntaNumber}>{index + 1}</span>
        <div className={styles.preguntaCardInfo}>
          <p className={styles.preguntaCardTitle}>{pregunta.texto}</p>
          <p className={styles.preguntaCardMeta}>
            {formatPreguntaTipo(pregunta.tipo)}
            {" · "}
            {pregunta.puntaje ?? 1} pts
          </p>
        </div>
      </div>
      <ul className={styles.preguntaOpciones}>
        {(pregunta.opciones ?? []).map((opcion) => (
          <li
            key={opcion.idOpcion}
            className={opcion.correcta ? styles.opcionCorrecta : styles.opcionNormal}
          >
            {opcion.texto}
            {opcion.correcta ? " ✓" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
