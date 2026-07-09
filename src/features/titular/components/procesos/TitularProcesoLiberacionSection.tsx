"use client";

import {
  canEmitirLiberacionTecnica,
  mensajeBloqueoLiberacionTecnica,
} from "@/lib/domain/proceso";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import type { ProcesoResponse } from "../../types/titular.types";
import type { TitularProcesoDetailPayload } from "../../actions/procesos.actions";

type TitularProcesoLiberacionSectionProps = {
  proceso: ProcesoResponse;
  detail: TitularProcesoDetailPayload;
  liberacionComentario: string;
  isMutating: boolean;
  onComentarioChange: (value: string) => void;
  onEmitir: () => void;
};

export function TitularProcesoLiberacionSection({
  proceso,
  detail,
  liberacionComentario,
  isMutating,
  onComentarioChange,
  onEmitir,
}: TitularProcesoLiberacionSectionProps) {
  if (detail.liberacionTecnica) {
    return (
      <div className={sectionStyles.stateNotice}>
        <strong>Liberación técnica registrada</strong>
        <span>Ya existe un registro de liberación técnica para este proceso.</span>
      </div>
    );
  }

  if (
    canEmitirLiberacionTecnica(
      proceso.estatus,
      detail.evaluacionFinal,
      detail.liberacionTecnica,
      proceso.horasAcumuladas,
      proceso.horasRequeridas,
    )
  ) {
    return (
      <div className={sectionStyles.registerPanel} aria-label="Emitir liberación técnica">
        <div className={sectionStyles.registerPanelHeader}>
          <h3 className={sectionStyles.registerPanelTitle}>Emitir liberación técnica</h3>
          <p className={sectionStyles.registerPanelDescription}>
            Confirma que el alumno cumple los requisitos del área.
          </p>
        </div>

        <FormField id="comentario-liberacion" label="Comentario (opcional)">
          <textarea
            id="comentario-liberacion"
            className={formStyles.textarea}
            rows={2}
            value={liberacionComentario}
            onChange={(event) => onComentarioChange(event.target.value)}
          />
        </FormField>

        <div className={sectionStyles.registerPanelActions}>
          <Button
            type="button"
            variant="success"
            disabled={isMutating}
            onClick={() => void onEmitir()}
          >
            Emitir liberación técnica
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p className={sectionStyles.emptyHint}>
      {mensajeBloqueoLiberacionTecnica(
        proceso.estatus,
        detail.evaluacionFinal,
        detail.liberacionTecnica,
        proceso.horasAcumuladas,
        proceso.horasRequeridas,
      )}
    </p>
  );
}
