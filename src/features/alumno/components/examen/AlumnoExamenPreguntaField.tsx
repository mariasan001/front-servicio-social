"use client";

import { formatPreguntaTipo } from "@/lib/domain";
import type { AlumnoExamenPreguntaResponse } from "@/lib/domain";
import styles from "./AlumnoExamenPostulacionView.module.css";

type AlumnoExamenPreguntaFieldProps = {
  pregunta: AlumnoExamenPreguntaResponse;
  index: number;
  selectedOpcionId?: number;
  onSelect: (idPregunta: number, idOpcion: number) => void;
};

export function AlumnoExamenPreguntaField({
  pregunta,
  index,
  selectedOpcionId,
  onSelect,
}: AlumnoExamenPreguntaFieldProps) {
  return (
    <fieldset className={styles.preguntaCard}>
      <legend className={styles.preguntaLegend}>
        {index + 1}. {pregunta.texto}
      </legend>
      {pregunta.tipo ? (
        <p className={styles.preguntaTipo}>{formatPreguntaTipo(pregunta.tipo)}</p>
      ) : null}
      <div className={styles.opcionesGroup}>
        {(pregunta.opciones ?? []).map((opcion) => (
          <label key={opcion.idOpcion} className={styles.opcionLabel}>
            <input
              type="radio"
              name={`pregunta-${pregunta.idPregunta}`}
              value={opcion.idOpcion}
              checked={selectedOpcionId === opcion.idOpcion}
              onChange={() => onSelect(pregunta.idPregunta, opcion.idOpcion)}
            />
            <span>{opcion.texto}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
