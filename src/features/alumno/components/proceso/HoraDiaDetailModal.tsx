"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  registerProcesoHoraAction,
  updateProcesoHoraBitacoraAction,
} from "../../actions/proceso.actions";
import type { HoraResponse } from "../../types/alumno.types";
import {
  formatDiaCompleto,
  formatHoraRange,
  formatHorasDia,
  isDateKeyToday,
} from "../../lib/horas-calendar.utils";
import { canAlumnoActualizarBitacora, validarRegistroHoraAlumno } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import styles from "./HoraDiaDetailModal.module.css";

type HoraRegisterDraft = {
  horaEntrada: string;
  horaSalida: string;
  descripcionActividades: string;
};

type HoraDiaDetailModalProps = {
  open: boolean;
  dateKey: string | null;
  horas: HoraResponse[];
  canRegister: boolean;
  idProceso?: number;
  initialRegister?: Partial<HoraRegisterDraft>;
  onClose: () => void;
  onRegistered?: () => void;
};

const EMPTY_REGISTER: HoraRegisterDraft = {
  horaEntrada: "",
  horaSalida: "",
  descripcionActividades: "",
};

function buildBitacoraDrafts(horas: HoraResponse[]) {
  return Object.fromEntries(
    horas.map((hora) => [hora.idAsistencia, hora.descripcionActividades?.trim() ?? ""]),
  );
}

export function HoraDiaDetailModal({
  open,
  dateKey,
  horas,
  canRegister,
  idProceso,
  initialRegister,
  onClose,
  onRegistered,
}: HoraDiaDetailModalProps) {
  const router = usePanelRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [registerDraft, setRegisterDraft] = useState<HoraRegisterDraft>(EMPTY_REGISTER);
  const [bitacoraDrafts, setBitacoraDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    setRegisterDraft({
      horaEntrada: initialRegister?.horaEntrada ?? "",
      horaSalida: initialRegister?.horaSalida ?? "",
      descripcionActividades: initialRegister?.descripcionActividades ?? "",
    });
    setBitacoraDrafts(buildBitacoraDrafts(horas));
  }, [open, dateKey, initialRegister, horas]);

  const savedBitacoras = useMemo(() => buildBitacoraDrafts(horas), [horas]);
  const editableHoras = useMemo(
    () => horas.filter((hora) => canAlumnoActualizarBitacora(hora.estatus)),
    [horas],
  );
  const hasBitacoraChanges = useMemo(
    () =>
      editableHoras.some(
        (hora) =>
          (bitacoraDrafts[hora.idAsistencia] ?? "").trim() !==
          (savedBitacoras[hora.idAsistencia] ?? "").trim(),
      ),
    [bitacoraDrafts, editableHoras, savedBitacoras],
  );

  if (!open || !dateKey) {
    return null;
  }

  const title = formatDiaCompleto(dateKey);
  const hasHoras = horas.length > 0;
  const totalHorasLabel = formatHorasDia(horas);
  const isToday = isDateKeyToday(dateKey);
  const showRegisterForm = canRegister && !hasHoras && isToday && Boolean(idProceso);

  const submitRegister = async () => {
    if (!idProceso) {
      return;
    }

    const payload = {
      fecha: dateKey,
      horaEntrada: registerDraft.horaEntrada,
      horaSalida: registerDraft.horaSalida,
      descripcionActividades: registerDraft.descripcionActividades,
    };
    const validationError = validarRegistroHoraAlumno(payload);

    if (validationError) {
      setActionError(validationError);
      return;
    }

    setIsMutating(true);
    setActionError(null);
    const result = await registerProcesoHoraAction(idProceso, {
      fecha: payload.fecha,
      horaEntrada: payload.horaEntrada,
      horaSalida: payload.horaSalida,
      descripcionActividades: payload.descripcionActividades.trim(),
    });
    setIsMutating(false);

    if (!result.success) {
      setActionError(result.error);
      return;
    }

    setRegisterDraft(EMPTY_REGISTER);
    onClose();
    onRegistered?.();
    router.refresh();
  };

  const submitBitacoraUpdates = async () => {
    if (!idProceso) {
      return;
    }

    const pendingUpdates = editableHoras.filter((hora) => {
      const draft = bitacoraDrafts[hora.idAsistencia]?.trim() ?? "";
      const saved = savedBitacoras[hora.idAsistencia]?.trim() ?? "";
      return draft !== saved;
    });

    if (pendingUpdates.length === 0) {
      return;
    }

    const invalidUpdate = pendingUpdates.find(
      (hora) => !(bitacoraDrafts[hora.idAsistencia]?.trim() ?? ""),
    );
    if (invalidUpdate) {
      setActionError("La descripción de actividades es obligatoria.");
      return;
    }

    setIsMutating(true);
    setActionError(null);
    setActionSuccess(null);

    const results = await Promise.all(
      pendingUpdates.map((hora) =>
        updateProcesoHoraBitacoraAction(idProceso, hora.idAsistencia, {
          descripcionActividades: bitacoraDrafts[hora.idAsistencia]?.trim() ?? "",
        }),
      ),
    );

    setIsMutating(false);

    const failed = results.find((result) => !result.success);
    if (failed && !failed.success) {
      setActionError(failed.error);
      return;
    }

    setActionSuccess("La bitácora se actualizó correctamente.");
    onRegistered?.();
    router.refresh();
  };

  const footer =
    showRegisterForm ? (
      <div className={detailStyles.footerActions}>
        <Button type="button" variant="outline" disabled={isMutating} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="success"
          disabled={isMutating}
          onClick={() => void submitRegister()}
        >
          {isMutating ? "Registrando…" : "Registrar horas"}
        </Button>
      </div>
    ) : hasBitacoraChanges ? (
      <div className={detailStyles.footerActions}>
        <Button type="button" variant="outline" disabled={isMutating} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="success"
          disabled={isMutating}
          onClick={() => void submitBitacoraUpdates()}
        >
          {isMutating ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    ) : undefined;

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      size="lg"
      footer={footer}
    >
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}
      {actionSuccess ? (
        <Alert tone="success" title="Cambios guardados">
          {actionSuccess}
        </Alert>
      ) : null}

      {showRegisterForm ? (
        <section className={sectionStyles.registerPanel} aria-labelledby="hora-register-title">
          <div className={sectionStyles.registerPanelHeader}>
            <h3 id="hora-register-title" className={sectionStyles.registerPanelTitle}>
              Registrar jornada
            </h3>
            <p className={sectionStyles.registerPanelDescription}>
              Indica tu horario y las actividades del día. Máximo 12 horas por jornada.
            </p>
          </div>

          <div className={sectionStyles.timeGrid}>
            <FormField id="hora-entrada-modal" label="Hora de entrada" required>
              <input
                id="hora-entrada-modal"
                type="time"
                className={formStyles.input}
                value={registerDraft.horaEntrada}
                onChange={(event) =>
                  setRegisterDraft((current) => ({
                    ...current,
                    horaEntrada: event.target.value,
                  }))
                }
              />
            </FormField>
            <FormField id="hora-salida-modal" label="Hora de salida" required>
              <input
                id="hora-salida-modal"
                type="time"
                className={formStyles.input}
                value={registerDraft.horaSalida}
                onChange={(event) =>
                  setRegisterDraft((current) => ({
                    ...current,
                    horaSalida: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          <FormField
            id="hora-descripcion-modal"
            label="Actividades realizadas"
            required
            hint="Describe brevemente qué hiciste durante tu jornada."
          >
            <textarea
              id="hora-descripcion-modal"
              className={formStyles.textarea}
              rows={3}
              value={registerDraft.descripcionActividades}
              onChange={(event) =>
                setRegisterDraft((current) => ({
                  ...current,
                  descripcionActividades: event.target.value,
                }))
              }
            />
          </FormField>
        </section>
      ) : !hasHoras ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <Clock size={22} strokeWidth={1.75} />
          </div>
          <p className={styles.emptyValue}>0 horas</p>
          <p className={styles.emptyTitle}>Sin jornadas registradas</p>
          <p className={styles.emptyHint}>
            {!canRegister
              ? "Cuando tu proceso esté activo podrás registrar tus jornadas desde aquí."
              : isToday
                ? "Indica tu horario de entrada, salida y las actividades que realizaste."
                : "Solo puedes registrar horas el mismo día de tu jornada. Este día no admite nuevos registros."}
          </p>
        </div>
      ) : (
        <div className={styles.dayContent}>
          <div className={styles.listHeader}>
            <p className={styles.listTitle}>Jornada del día</p>
            <span className={styles.listMeta}>
              {horas.length} {horas.length === 1 ? "registro" : "registros"} · {totalHorasLabel}
            </span>
          </div>

          <ul className={styles.list}>
            {horas.map((hora) => {
              const descripcion = hora.descripcionActividades?.trim() ?? "";
              const canEditBitacora = canAlumnoActualizarBitacora(hora.estatus);

              return (
                <li key={hora.idAsistencia} className={styles.horaCard}>
                  <div className={styles.horaMain}>
                    <div className={styles.horaTimeBlock}>
                      <Clock
                        size={15}
                        strokeWidth={1.75}
                        className={styles.horaTimeIcon}
                        aria-hidden="true"
                      />
                      <div>
                        <p className={styles.horaRange}>
                          {formatHoraRange(hora.horaEntrada, hora.horaSalida)}
                        </p>
                        <p className={styles.horaMeta}>
                          {hora.horasRegistradas ?? "—"} h registradas
                        </p>
                      </div>
                    </div>
                    <EstatusBadge estatus={hora.estatus} />
                  </div>

                  <div className={styles.horaDetail}>
                    <p className={styles.horaDetailLabel}>Actividades realizadas</p>
                    {canEditBitacora ? (
                      <>
                        <textarea
                          id={`bitacora-${hora.idAsistencia}`}
                          className={formStyles.textarea}
                          rows={3}
                          aria-label="Actividades realizadas"
                          value={bitacoraDrafts[hora.idAsistencia] ?? ""}
                          onChange={(event) =>
                            setBitacoraDrafts((current) => ({
                              ...current,
                              [hora.idAsistencia]: event.target.value,
                            }))
                          }
                        />
                        <p className={styles.horaEditHint}>
                          Puedes actualizar la descripción mientras el registro esté en revisión.
                        </p>
                      </>
                    ) : descripcion ? (
                      <p className={styles.horaDescription}>{descripcion}</p>
                    ) : (
                      <p className={styles.horaDescriptionMuted}>Sin descripción registrada.</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!showRegisterForm && !canRegister && !hasHoras ? (
        <Alert tone="info">
          Podrás registrar horas cuando tu proceso esté activo y la delegación haya emitido la
          carta de aceptación.
        </Alert>
      ) : null}
    </Modal>
  );
}
