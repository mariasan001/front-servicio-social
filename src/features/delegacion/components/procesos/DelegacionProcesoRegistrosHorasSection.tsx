"use client";

import {
  canCancelHora,
  canObserveHora,
  canRejectHora,
  canValidateHora,
  HORA_OBSERVAR_SOLO_ACTIVIDADES_DELEGACION,
} from "@/lib/domain/horas";
import { formatFecha } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import { resolveHorasRegistradas } from "@/shared/proceso";
import type { ProcesoHoraResponse } from "../../types/delegacion.types";

type DelegacionProcesoRegistrosHorasSectionProps = {
  horas: ProcesoHoraResponse[];
  comentario: string;
  isMutating: boolean;
  onComentarioChange: (value: string) => void;
  onHoraAction: (action: "validate" | "observe" | "reject" | "cancel", idAsistencia: number) => void;
};

export function DelegacionProcesoRegistrosHorasSection({
  horas,
  comentario,
  isMutating,
  onComentarioChange,
  onHoraAction,
}: DelegacionProcesoRegistrosHorasSectionProps) {
  const hasActionableHoras = horas.some(
    (hora) =>
      canValidateHora(hora.estatus) ||
      canObserveHora(hora.estatus) ||
      canRejectHora(hora.estatus) ||
      canCancelHora(hora.estatus),
  );

  return (
    <>
      {hasActionableHoras ? (
        <Alert tone="info">{HORA_OBSERVAR_SOLO_ACTIVIDADES_DELEGACION}</Alert>
      ) : null}
      {horas.length === 0 ? (
        <p className={sectionStyles.emptyHint}>No hay horas registradas.</p>
      ) : (
        <ul className={sectionStyles.recordList}>
          {horas.map((hora) => {
            const horasRegistradas = resolveHorasRegistradas(hora);
            const canAct =
              canValidateHora(hora.estatus) ||
              canObserveHora(hora.estatus) ||
              canRejectHora(hora.estatus) ||
              canCancelHora(hora.estatus);

            return (
              <li key={hora.idAsistencia} className={sectionStyles.horaCard}>
                <div className={sectionStyles.horaCardBody}>
                  <div className={sectionStyles.horaCardMeta}>
                    <span className={sectionStyles.horaCardDate}>
                      {hora.fecha ? formatFecha(hora.fecha) : "Sin fecha"}
                    </span>
                    {horasRegistradas !== null ? (
                      <span className={sectionStyles.horaCardHours}>
                        {horasRegistradas} h registradas
                      </span>
                    ) : null}
                  </div>
                  <EstatusBadge estatus={hora.estatus} />
                </div>
                {canAct ? (
                  <div className={sectionStyles.horaCardActions}>
                    {canValidateHora(hora.estatus) ? (
                      <Button
                        type="button"
                        variant="primary"
                        disabled={isMutating}
                        onClick={() => onHoraAction("validate", hora.idAsistencia)}
                      >
                        Validar
                      </Button>
                    ) : null}
                    {canObserveHora(hora.estatus) ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isMutating}
                        onClick={() => onHoraAction("observe", hora.idAsistencia)}
                      >
                        Pedir corrección
                      </Button>
                    ) : null}
                    {canRejectHora(hora.estatus) ? (
                      <Button
                        type="button"
                        variant="outline"
                        className={detailStyles.dangerButton}
                        disabled={isMutating}
                        onClick={() => onHoraAction("reject", hora.idAsistencia)}
                      >
                        Rechazar
                      </Button>
                    ) : null}
                    {canCancelHora(hora.estatus) ? (
                      <Button
                        type="button"
                        variant="outline"
                        className={detailStyles.neutralButton}
                        disabled={isMutating}
                        onClick={() => onHoraAction("cancel", hora.idAsistencia)}
                      >
                        Cancelar
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {hasActionableHoras ? (
        <FormField
          id="comentario-horas"
          label="Comentario (opcional para validar; obligatorio para pedir corrección o rechazar)"
          hint={HORA_OBSERVAR_SOLO_ACTIVIDADES_DELEGACION}
        >
          <textarea
            id="comentario-horas"
            className={formStyles.textarea}
            rows={2}
            value={comentario}
            onChange={(event) => onComentarioChange(event.target.value)}
          />
        </FormField>
      ) : null}
    </>
  );
}
