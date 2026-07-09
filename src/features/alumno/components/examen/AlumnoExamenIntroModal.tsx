"use client";

import { Clock, Lock, ShieldCheck, TimerReset } from "lucide-react";
import { formatTiempoLimite, type AlumnoExamenDisponibleResponse } from "@/lib/domain";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { MAX_EXAMEN_SALIDAS } from "./alumno-examen.utils";
import styles from "./AlumnoExamenPostulacionView.module.css";

type AlumnoExamenIntroModalProps = {
  examen: AlumnoExamenDisponibleResponse;
  isStarting: boolean;
  onCancel: () => void;
  onStart: () => void;
};

export function AlumnoExamenIntroModal({
  examen,
  isStarting,
  onCancel,
  onStart,
}: AlumnoExamenIntroModalProps) {
  return (
    <Modal
      open
      title="Antes de comenzar la evaluación"
      size="md"
      onClose={onCancel}
      footer={
        <div className={styles.introFooter}>
          <Button type="button" variant="outline" disabled={isStarting} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" disabled={isStarting} onClick={() => void onStart()}>
            {isStarting ? "Iniciando…" : "Comenzar evaluación"}
          </Button>
        </div>
      }
    >
      <div className={styles.introHero}>
        <span className={styles.introHeroIcon}>
          <ShieldCheck size={24} aria-hidden="true" />
        </span>
        <div className={styles.introHeroText}>
          <h3 className={styles.introHeroTitle}>Evaluación con seguimiento</h3>
          <p className={styles.introHeroSubtitle}>
            Lee las condiciones antes de iniciar. Tu actividad se registra para garantizar una
            evaluación genuina.
          </p>
        </div>
      </div>

      <ul className={styles.introList}>
        <li className={styles.introItem}>
          <span className={styles.introItemIcon}>
            <ShieldCheck size={16} aria-hidden="true" />
          </span>
          <span>
            Esta es una <strong>evaluación oficial</strong> de tu proceso. Respóndela de forma
            individual y honesta.
          </span>
        </li>
        <li className={styles.introItem}>
          <span className={styles.introItemIcon}>
            <TimerReset size={16} aria-hidden="true" />
          </span>
          <span>
            Solo tienes <strong>un intento</strong>. Al comenzar inicia el cronómetro y no podrás
            reiniciarlo.
          </span>
        </li>
        <li className={styles.introItem}>
          <span className={styles.introItemIcon}>
            <Clock size={16} aria-hidden="true" />
          </span>
          <span>
            Si se agota el tiempo, tus respuestas se <strong>guardan automáticamente</strong> hasta
            donde llegaste.
          </span>
        </li>
        <li className={styles.introItem}>
          <span className={styles.introItemIcon}>
            <Lock size={16} aria-hidden="true" />
          </span>
          <span>
            Está deshabilitado copiar y pegar. Si cambias de pestaña o ventana quedará registrado;
            tras {MAX_EXAMEN_SALIDAS} salidas la evaluación se enviará sola.
          </span>
        </li>
      </ul>

      <div className={styles.introMeta}>
        <span className={styles.introMetaChip}>
          Examen
          <strong>{examen.titulo}</strong>
        </span>
        <span className={styles.introMetaChip}>
          Preguntas
          <strong>{examen.preguntas?.length ?? 0}</strong>
        </span>
        <span className={styles.introMetaChip}>
          Tiempo límite
          <strong>{formatTiempoLimite(examen.tiempoLimiteMinutos)}</strong>
        </span>
      </div>

      {examen.instrucciones ? (
        <p className={styles.introWarning}>
          <strong>Instrucciones: </strong>
          {examen.instrucciones}
        </p>
      ) : null}
    </Modal>
  );
}
