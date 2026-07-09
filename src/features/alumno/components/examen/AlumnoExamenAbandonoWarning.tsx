"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { MAX_EXAMEN_SALIDAS } from "./alumno-examen.utils";
import styles from "./AlumnoExamenPostulacionView.module.css";

type AlumnoExamenAbandonoWarningProps = {
  salidas: number;
  onContinue: () => void;
};

export function AlumnoExamenAbandonoWarning({ salidas, onContinue }: AlumnoExamenAbandonoWarningProps) {
  return (
    <div className={styles.abandonoOverlay} role="alertdialog" aria-modal="true">
      <div className={styles.abandonoCard}>
        <span className={styles.abandonoIcon}>
          <AlertTriangle size={28} aria-hidden="true" />
        </span>
        <h3 className={styles.abandonoTitle}>Saliste de la evaluación</h3>
        <p className={styles.abandonoText}>
          Detectamos que cambiaste de pestaña o ventana. Esto queda registrado. Llevas{" "}
          <span className={styles.abandonoCount}>
            {salidas} de {MAX_EXAMEN_SALIDAS}
          </span>{" "}
          salidas permitidas. Si llegas al límite, la evaluación se enviará automáticamente.
        </p>
        <Button type="button" variant="primary" onClick={onContinue}>
          Continuar evaluación
        </Button>
      </div>
    </div>
  );
}
