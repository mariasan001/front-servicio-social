"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  registerProcesoHoraAction,
  rejectProcesoHoraAction,
  validateProcesoHoraAction,
} from "../../actions/procesos.actions";
import type { HoraResponse } from "../../types/titular.types";
import {
  formatDiaCompleto,
  formatHoraRange,
  formatHorasDia,
} from "@/features/alumno/lib/horas-calendar.utils";
import {
  canRejectHora,
  canValidateHora,
  validarRegistroHoraAlumno,
} from "@/lib/domain/horas";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import alumnoDayStyles from "@/features/alumno/components/proceso/HoraDiaDetailModal.module.css";

type RegisterDraft = {
  horaEntrada: string;
  horaSalida: string;
  descripcionActividades: string;
};

const EMPTY_REGISTER: RegisterDraft = {
  horaEntrada: "",
  horaSalida: "",
  descripcionActividades: "",
};

type TitularHoraDiaDetailModalProps = {
  open: boolean;
  dateKey: string | null;
  horas: HoraResponse[];
  idProceso: number;
  canRegister: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export function TitularHoraDiaDetailModal({
  open,
  dateKey,
  horas,
  idProceso,
  canRegister,
  onClose,
  onUpdated,
}: TitularHoraDiaDetailModalProps) {
  const [isMutating, setIsMutating] = useState(false);
  const [comentario, setComentario] = useState("");
  const [registerDraft, setRegisterDraft] = useState<RegisterDraft>(EMPTY_REGISTER);

  useEffect(() => {
    if (!open) {
      return;
    }

    setComentario("");
    setRegisterDraft(EMPTY_REGISTER);
  }, [open, dateKey]);

  if (!open || !dateKey) {
    return null;
  }

  const hasHoras = horas.length > 0;
  const showRegisterForm = canRegister && !hasHoras;
  const hasActionableHoras = horas.some(
    (hora) => canValidateHora(hora.estatus) || canRejectHora(hora.estatus),
  );

  const runHoraAction = async (action: "validate" | "reject", idAsistencia: number) => {
    setIsMutating(true);
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(
            idProceso,
            idAsistencia,
            comentario.trim() ? { comentario: comentario.trim() } : {},
          )
        : await rejectProcesoHoraAction(idProceso, idAsistencia, {
            comentario: comentario.trim() || "Registro rechazado.",
          });
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    setComentario("");
    onUpdated();
  };

  const submitRegister = async () => {
    const payload = {
      fecha: dateKey,
      horaEntrada: registerDraft.horaEntrada,
      horaSalida: registerDraft.horaSalida,
      descripcionActividades: registerDraft.descripcionActividades,
    };
    const validationError = validarRegistroHoraAlumno(payload);

    if (validationError) {
      notify.error(validationError);
      return;
    }

    setIsMutating(true);
    const result = await registerProcesoHoraAction(idProceso, {
      fecha: payload.fecha,
      horaEntrada: payload.horaEntrada,
      horaSalida: payload.horaSalida,
      descripcionActividades: payload.descripcionActividades.trim(),
    });
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    onClose();
    onUpdated();
  };

  const footer = showRegisterForm ? (
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
        {isMutating ? "Registrando…" : "Registrar hora"}
      </Button>
    </div>
  ) : undefined;

  return (
    <Modal open title={formatDiaCompleto(dateKey)} onClose={onClose} size="lg" footer={footer}>
      {showRegisterForm ? (
        <section className={sectionStyles.registerPanel} aria-labelledby="titular-hora-register-title">
          <div className={sectionStyles.registerPanelHeader}>
            <h3 id="titular-hora-register-title" className={sectionStyles.registerPanelTitle}>
              Registrar hora interna
            </h3>
            <p className={sectionStyles.registerPanelDescription}>
              Captura la asistencia del alumno para este día.
            </p>
          </div>

          <div className={sectionStyles.timeGrid}>
            <FormField id="titular-hora-entrada" label="Hora entrada" required>
              <input
                id="titular-hora-entrada"
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
            <FormField id="titular-hora-salida" label="Hora salida" required>
              <input
                id="titular-hora-salida"
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

          <FormField id="titular-hora-actividades" label="Actividades realizadas" required>
            <textarea
              id="titular-hora-actividades"
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
        <div className={alumnoDayStyles.emptyState}>
          <div className={alumnoDayStyles.emptyIcon} aria-hidden="true">
            <Clock size={22} strokeWidth={1.75} />
          </div>
          <p className={alumnoDayStyles.emptyValue}>0 horas</p>
          <p className={alumnoDayStyles.emptyTitle}>Sin jornadas registradas</p>
          <p className={alumnoDayStyles.emptyHint}>
            {canRegister
              ? "Este día no tiene registros. Puedes capturar una hora interna si corresponde."
              : "Este día no tiene registros de horas."}
          </p>
        </div>
      ) : (
        <div className={alumnoDayStyles.dayContent}>
          <div className={alumnoDayStyles.listHeader}>
            <p className={alumnoDayStyles.listTitle}>Jornada del día</p>
            <span className={alumnoDayStyles.listMeta}>
              {horas.length} {horas.length === 1 ? "registro" : "registros"} · {formatHorasDia(horas)}
            </span>
          </div>

          <ul className={alumnoDayStyles.list}>
            {horas.map((hora) => {
              const descripcion = hora.descripcionActividades?.trim() ?? "";
              const canAct =
                canValidateHora(hora.estatus) || canRejectHora(hora.estatus);

              return (
                <li key={hora.idAsistencia} className={alumnoDayStyles.horaCard}>
                  <div className={alumnoDayStyles.horaMain}>
                    <div className={alumnoDayStyles.horaTimeBlock}>
                      <Clock
                        size={15}
                        strokeWidth={1.75}
                        className={alumnoDayStyles.horaTimeIcon}
                        aria-hidden="true"
                      />
                      <div>
                        <p className={alumnoDayStyles.horaRange}>
                          {formatHoraRange(hora.horaEntrada, hora.horaSalida)}
                        </p>
                        <p className={alumnoDayStyles.horaMeta}>
                          {hora.horasRegistradas ?? "—"} h registradas
                        </p>
                      </div>
                    </div>
                    <EstatusBadge estatus={hora.estatus} />
                  </div>

                  <div className={alumnoDayStyles.horaDetail}>
                    <p className={alumnoDayStyles.horaDetailLabel}>Actividades realizadas</p>
                    {descripcion ? (
                      <p className={alumnoDayStyles.horaDescription}>{descripcion}</p>
                    ) : (
                      <p className={alumnoDayStyles.horaDescriptionMuted}>Sin descripción registrada.</p>
                    )}
                  </div>

                  {canAct ? (
                    <div className={sectionStyles.horaCardActions}>
                      {canValidateHora(hora.estatus) ? (
                        <Button
                          type="button"
                          variant="success"
                          disabled={isMutating}
                          onClick={() => void runHoraAction("validate", hora.idAsistencia)}
                        >
                          Validar
                        </Button>
                      ) : null}
                      {canRejectHora(hora.estatus) ? (
                        <Button
                          type="button"
                          variant="danger"
                          disabled={isMutating}
                          onClick={() => void runHoraAction("reject", hora.idAsistencia)}
                        >
                          Rechazar
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {hasActionableHoras ? (
            <FormField
              id="titular-comentario-hora"
              label="Comentario (opcional para validar o rechazar)"
            >
              <textarea
                id="titular-comentario-hora"
                className={formStyles.textarea}
                rows={2}
                value={comentario}
                onChange={(event) => setComentario(event.target.value)}
              />
            </FormField>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
