"use client";

import { type ClipboardEvent } from "react";
import { Clock, FileQuestion } from "lucide-react";
import type { AlumnoExamenDisponibleResponse, AlumnoExamenPreguntaResponse } from "@/lib/domain";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { AlumnoExamenPreguntaField } from "./AlumnoExamenPreguntaField";
import { formatExamenRemaining } from "./alumno-examen.utils";
import styles from "./AlumnoExamenPostulacionView.module.css";

type AlumnoExamenInProgressPanelProps = {
  examen: AlumnoExamenDisponibleResponse;
  preguntas: AlumnoExamenPreguntaResponse[];
  respuestas: Record<number, number>;
  remainingMs: number | null;
  respondidas: number;
  isSubmitting: boolean;
  onSelectRespuesta: (idPregunta: number, idOpcion: number) => void;
  onSubmit: () => void;
};

export function AlumnoExamenInProgressPanel({
  examen,
  preguntas,
  respuestas,
  remainingMs,
  respondidas,
  isSubmitting,
  onSelectRespuesta,
  onSubmit,
}: AlumnoExamenInProgressPanelProps) {
  const isTimeWarning = remainingMs !== null && remainingMs <= 60_000;

  const blockClipboard = (event: ClipboardEvent<HTMLElement>) => {
    event.preventDefault();
    notify.error("Durante la evaluación no está permitido copiar ni pegar.");
  };

  return (
    <div className={styles.examLayout}>
      <div className={styles.examIntro}>
        <span className={styles.examIcon} aria-hidden="true">
          <FileQuestion size={22} strokeWidth={1.75} />
        </span>
        <div>
          <h2 className={styles.examTitle}>{examen.titulo}</h2>
          {examen.descripcion ? (
            <p className={styles.examDescription}>{examen.descripcion}</p>
          ) : null}
          {examen.instrucciones ? (
            <p className={styles.examInstructions}>
              <strong>Instrucciones: </strong>
              {examen.instrucciones}
            </p>
          ) : null}
          {examen.tiempoLimiteMinutos ? (
            <p className={styles.examMeta}>Tiempo límite: {examen.tiempoLimiteMinutos} minutos</p>
          ) : null}
        </div>
      </div>

      {remainingMs !== null ? (
        <div className={styles.timerBar}>
          <div className={styles.timerInfo}>
            <span className={styles.timerLabel}>Tiempo restante</span>
            <span className={styles.timerProgress}>
              {respondidas} de {preguntas.length} respondidas
            </span>
          </div>
          <span
            className={[styles.timerClock, isTimeWarning ? styles.timerClockWarning : ""]
              .filter(Boolean)
              .join(" ")}
            role="timer"
            aria-live={isTimeWarning ? "assertive" : "off"}
          >
            <Clock size={16} aria-hidden="true" />
            {formatExamenRemaining(remainingMs)}
          </span>
        </div>
      ) : null}

      <form
        className={styles.preguntasForm}
        onCopy={blockClipboard}
        onCut={blockClipboard}
        onPaste={blockClipboard}
        onContextMenu={(event) => event.preventDefault()}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {preguntas.map((pregunta, index) => (
          <AlumnoExamenPreguntaField
            key={pregunta.idPregunta}
            pregunta={pregunta}
            index={index}
            selectedOpcionId={respuestas[pregunta.idPregunta]}
            onSelect={onSelectRespuesta}
          />
        ))}

        <div className={styles.submitRow}>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Enviando respuestas…" : "Finalizar examen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
