"use client";

import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";

type DelegacionProcesoCancelacionSectionProps = {
  canCancel: boolean;
  motivoCancelacion: string;
  isMutating: boolean;
  onMotivoChange: (value: string) => void;
  onCancelar: () => void;
};

export function DelegacionProcesoCancelacionSection({
  canCancel,
  motivoCancelacion,
  isMutating,
  onMotivoChange,
  onCancelar,
}: DelegacionProcesoCancelacionSectionProps) {
  if (!canCancel) {
    return (
      <p className={sectionStyles.emptyHint}>
        Este proceso no puede cancelarse en su estatus actual.
      </p>
    );
  }

  return (
    <div className={sectionStyles.registerPanel} aria-label="Cancelar proceso">
      <div className={sectionStyles.registerPanelHeader}>
        <h3 className={sectionStyles.registerPanelTitle}>Cancelar proceso</h3>
        <p className={sectionStyles.registerPanelDescription}>
          Esta acción detiene el servicio social del alumno. Indica el motivo.
        </p>
      </div>

      <FormField id="motivo-cancel" label="Motivo de cancelación" required>
        <textarea
          id="motivo-cancel"
          className={formStyles.textarea}
          rows={3}
          value={motivoCancelacion}
          onChange={(event) => onMotivoChange(event.target.value)}
        />
      </FormField>

      <div className={sectionStyles.registerPanelActions}>
        <Button
          type="button"
          variant="outline"
          className={detailStyles.dangerButton}
          disabled={isMutating}
          onClick={() => void onCancelar()}
        >
          Cancelar proceso
        </Button>
      </div>
    </div>
  );
}
