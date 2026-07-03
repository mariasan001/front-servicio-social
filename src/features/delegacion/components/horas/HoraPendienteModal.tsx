"use client";

import { Clock3 } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useRef, useState } from "react";
import {
  cancelProcesoHoraAction,
  observeProcesoHoraAction,
  rejectProcesoHoraAction,
  validateProcesoHoraAction,
} from "../../actions/procesos.actions";
import type { HoraPendienteResponse } from "../../types/delegacion.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import {
  canCancelHora,
  canObserveHora,
  canRejectHora,
  canValidateHora,
  isHoraPendienteRevision,
} from "@/lib/domain/horas";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import formLayoutStyles from "@/shared/styles/PanelFormModal.module.css";

export function HoraPendienteModal({
  hora,
  open,
  onClose,
}: {
  hora: HoraPendienteResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = usePanelRouter();
  const horaRef = useRef(hora);
  horaRef.current = hora;
  const [comentario, setComentario] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const { detail, error } = useDetailModalLoader(
    open,
    hora?.idAsistencia ?? null,
    async (id) => {
      const current = horaRef.current;
      if (!current || current.idAsistencia !== id) {
        return { success: false as const, error: "No se encontró el registro de horas." };
      }
      return { success: true as const, data: current };
    },
    {
      onBeforeLoad: () => {
        setComentario("");
        setActionError(null);
      },
    },
  );

  const run = async (action: "validate" | "observe" | "reject" | "cancel") => {
    if (!detail) return;
    setIsMutating(true);
    setActionError(null);
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(
            detail.idProceso,
            detail.idAsistencia,
            comentario.trim() ? { comentario: comentario.trim() } : {},
          )
        : action === "observe"
          ? await observeProcesoHoraAction(detail.idProceso, detail.idAsistencia, {
              comentario: comentario.trim() || "Observación registrada.",
            })
          : action === "reject"
            ? await rejectProcesoHoraAction(detail.idProceso, detail.idAsistencia, {
                comentario: comentario.trim() || "Registro rechazado.",
              })
            : await cancelProcesoHoraAction(detail.idProceso, detail.idAsistencia, {
                motivo: comentario.trim() || "Cancelado por delegación.",
              });
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    router.refresh();
    onClose();
  };

  const alumnoNombre = detail?.alumnoNombre?.trim();
  const canReview = detail ? isHoraPendienteRevision(detail.estatus) : false;

  return (
    <Modal
      open={open}
      title={alumnoNombre || "Revisar horas"}
      onClose={onClose}
      size="lg"
    >
      {detail ? (
        <div className={styles.layout}>
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}
          {error ? <Alert tone="error">{error}</Alert> : null}

          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <Clock3 size={18} strokeWidth={1.75} />
            </div>
            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{alumnoNombre || "Sin alumno registrado"}</p>
              <p className={styles.summarySecondary}>
                Proceso #{detail.idProceso} · Registro #{detail.idAsistencia}
              </p>
            </div>
            <StatusBadge tone={estatusTone(detail.estatus)}>
              {formatEtiqueta(detail.estatus, "Sin estatus")}
            </StatusBadge>
          </div>

          {canReview ? (
            <section className={styles.section} aria-label="Revisar registro de horas">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Revisar registro</h3>
                <p className={styles.sectionDescription}>
                  Valida, observa o rechaza el registro enviado por el alumno.
                </p>
              </div>
              <div className={formLayoutStyles.formLayout}>
                <FormField id="hora-comentario" label="Comentario">
                  <textarea
                    id="hora-comentario"
                    className={formStyles.textarea}
                    rows={3}
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                  />
                </FormField>
                <div className={formLayoutStyles.formActions}>
                  {canValidateHora(detail.estatus) ? (
                    <Button type="button" disabled={isMutating} onClick={() => void run("validate")}>
                      Validar
                    </Button>
                  ) : null}
                  {canObserveHora(detail.estatus) ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isMutating}
                      onClick={() => void run("observe")}
                    >
                      Observar
                    </Button>
                  ) : null}
                  {canRejectHora(detail.estatus) ? (
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.dangerButton}
                      disabled={isMutating}
                      onClick={() => void run("reject")}
                    >
                      Rechazar
                    </Button>
                  ) : null}
                  {canCancelHora(detail.estatus) ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isMutating}
                      onClick={() => void run("cancel")}
                    >
                      Cancelar
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>
          ) : (
            <p className={styles.sectionDescription}>
              Este registro ya fue revisado y no admite más acciones.
            </p>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
