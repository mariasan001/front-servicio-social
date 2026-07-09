"use client";

import {
  canRegistrarEvaluacionFinal,
  EVALUACION_FINAL_ESTATUS,
  EVALUACION_FINAL_ESTATUS_LABELS,
  mensajeBloqueoEvaluacionFinal,
} from "@/lib/domain/proceso";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import type { ProcesoResponse } from "../../types/titular.types";
import type { TitularProcesoDetailPayload } from "../../actions/procesos.actions";

type TitularProcesoEvaluacionSectionProps = {
  proceso: ProcesoResponse;
  detail: TitularProcesoDetailPayload;
  evaluacion: {
    estatus: string;
    calificacion: string;
    comentario: string;
  };
  isMutating: boolean;
  onEvaluacionChange: (value: TitularProcesoEvaluacionSectionProps["evaluacion"]) => void;
  onRegistrar: () => void;
};

export function TitularProcesoEvaluacionSection({
  proceso,
  detail,
  evaluacion,
  isMutating,
  onEvaluacionChange,
  onRegistrar,
}: TitularProcesoEvaluacionSectionProps) {
  if (detail.evaluacionFinal) {
    return (
      <div className={sectionStyles.stateNotice}>
        <strong>Evaluación final registrada</strong>
        <span>La evaluación final ya fue capturada para este proceso.</span>
      </div>
    );
  }

  if (
    canRegistrarEvaluacionFinal(
      proceso.estatus,
      detail.evaluacionFinal,
      proceso.horasAcumuladas,
      proceso.horasRequeridas,
    )
  ) {
    return (
      <div className={sectionStyles.registerPanel} aria-label="Registrar evaluación final">
        <div className={sectionStyles.registerPanelHeader}>
          <h3 className={sectionStyles.registerPanelTitle}>Calificación final</h3>
          <p className={sectionStyles.registerPanelDescription}>
            Registra el desempeño del alumno al concluir el servicio.
          </p>
        </div>

        <div className={sectionStyles.fieldGridTwo}>
          <FormField id="eval-estatus" label="Estatus de evaluación" required>
            <select
              id="eval-estatus"
              className={formStyles.select}
              value={evaluacion.estatus}
              onChange={(event) =>
                onEvaluacionChange({ ...evaluacion, estatus: event.target.value })
              }
            >
              {EVALUACION_FINAL_ESTATUS.map((estatus) => (
                <option key={estatus} value={estatus}>
                  {EVALUACION_FINAL_ESTATUS_LABELS[estatus]}
                </option>
              ))}
            </select>
          </FormField>
          <TextInput
            id="eval-calificacion"
            label="Calificación"
            type="number"
            min={0}
            max={100}
            value={evaluacion.calificacion}
            onChange={(event) =>
              onEvaluacionChange({ ...evaluacion, calificacion: event.target.value })
            }
          />
        </div>

        <FormField id="eval-comentario" label="Comentario (opcional)">
          <textarea
            id="eval-comentario"
            className={formStyles.textarea}
            rows={3}
            value={evaluacion.comentario}
            onChange={(event) =>
              onEvaluacionChange({ ...evaluacion, comentario: event.target.value })
            }
          />
        </FormField>

        <div className={sectionStyles.registerPanelActions}>
          <Button
            type="button"
            variant="success"
            disabled={isMutating}
            onClick={() => void onRegistrar()}
          >
            Registrar evaluación
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p className={sectionStyles.emptyHint}>
      {mensajeBloqueoEvaluacionFinal(
        proceso.estatus,
        detail.evaluacionFinal,
        proceso.horasAcumuladas,
        proceso.horasRequeridas,
      )}
    </p>
  );
}
