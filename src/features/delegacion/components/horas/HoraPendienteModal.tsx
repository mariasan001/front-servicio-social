"use client";

import { Clock3 } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  cancelProcesoHoraAction,
  getHoraPendienteDetailAction,
  observeProcesoHoraAction,
  rejectProcesoHoraAction,
  validateProcesoHoraAction,
} from "../../actions/procesos.actions";
import type { HoraPendienteDetail, HoraPendienteResponse } from "../../types/delegacion.types";
import { formatFecha } from "@/lib/domain/labels";
import {
  canCancelHora,
  canObserveHora,
  canRejectHora,
  canValidateHora,
  HORA_OBSERVAR_SOLO_ACTIVIDADES_DELEGACION,
  isHoraPendienteRevision,
} from "@/lib/domain/horas";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import { Alert } from "@/shared/components/Alert";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";

function formatHoraValue(value?: string) {
  if (!value?.trim()) {
    return "Sin registro";
  }

  return value.trim();
}

function formatHorasRegistradas(value?: number) {
  if (value === undefined || value === null) {
    return "Sin registro";
  }

  return `${value} ${value === 1 ? "hora" : "horas"}`;
}

function buildBaseDetail(hora: HoraPendienteResponse): HoraPendienteDetail {
  return {
    idAsistencia: hora.idAsistencia,
    idProceso: hora.idProceso,
    estatus: hora.estatus,
    alumnoNombre: hora.alumnoNombre,
    folioProceso: hora.folioProceso,
    fecha: hora.fecha,
    horasRegistradas: hora.horasRegistradas,
    horaEntrada: hora.horaEntrada,
    horaSalida: hora.horaSalida,
    descripcionActividades: hora.descripcionActividades,
  };
}

function hasHoraDetalle(hora: HoraPendienteResponse) {
  return Boolean(
    hora.fecha?.trim() ||
      hora.horaEntrada?.trim() ||
      hora.horaSalida?.trim() ||
      hora.descripcionActividades?.trim() ||
      hora.horasRegistradas != null,
  );
}

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
  const [comentario, setComentario] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    hora?.idAsistencia ?? null,
    async (idAsistencia) => {
      if (!hora || hora.idAsistencia !== idAsistencia) {
        return { success: false as const, error: "No se encontró el registro de horas." };
      }

      if (!hora.idProceso) {
        return { success: false as const, error: "No se pudo identificar el proceso del registro." };
      }

      const baseDetail = buildBaseDetail(hora);

      if (hasHoraDetalle(hora)) {
        return { success: true as const, data: baseDetail };
      }

      const result = await getHoraPendienteDetailAction(hora.idProceso, idAsistencia);
      if (!result.success) {
        return result;
      }

      return {
        success: true as const,
        data: {
          ...baseDetail,
          ...result.data,
          alumnoNombre: hora.alumnoNombre ?? result.data.alumnoNombre,
          folioProceso: hora.folioProceso ?? result.data.folioProceso,
        },
      };
    },
    {
      onBeforeLoad: () => {
        setComentario("");
      },
    },
  );

  const run = async (action: "validate" | "observe" | "reject" | "cancel") => {
    if (!detail?.idProceso || !detail.idAsistencia) {
      notify.error("No se pudo identificar el registro para actualizar.");
      return;
    }

    if ((action === "observe" || action === "reject") && !comentario.trim()) {
      notify.error(
        action === "observe"
          ? "Escribe qué debe corregir el alumno."
          : "Escribe el motivo del rechazo.",
      );
      return;
    }

    setIsMutating(true);

    const result =
      action === "validate"
        ? await validateProcesoHoraAction(
            detail.idProceso,
            detail.idAsistencia,
            comentario.trim() ? { comentario: comentario.trim() } : {},
          )
        : action === "observe"
          ? await observeProcesoHoraAction(detail.idProceso, detail.idAsistencia, {
              comentario: comentario.trim(),
            })
          : action === "reject"
            ? await rejectProcesoHoraAction(detail.idProceso, detail.idAsistencia, {
                comentario: comentario.trim(),
              })
            : await cancelProcesoHoraAction(detail.idProceso, detail.idAsistencia, {
                motivo: comentario.trim() || "Cancelado por delegación.",
              });

    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    notify.success(
      action === "validate"
        ? "Registro validado. Si el alumno ya completó las horas requeridas, el titular podrá registrar la evaluación final."
        : action === "observe"
          ? "Se solicitó corrección al alumno. Solo podrá ajustar las actividades realizadas, no el horario."
          : action === "reject"
            ? "Registro rechazado."
            : "Registro cancelado.",
    );
    router.refresh();
    onClose();
  };

  const alumnoNombre = detail?.alumnoNombre?.trim() || hora?.alumnoNombre?.trim();
  const procesoLabel =
    detail?.folioProceso?.trim() ||
    hora?.folioProceso?.trim() ||
    (detail?.idProceso ? `Proceso #${detail.idProceso}` : "Sin proceso");
  const canReview = detail ? isHoraPendienteRevision(detail.estatus) : false;
  const descripcion = detail?.descripcionActividades?.trim();

  return (
    <Modal
      open={open}
      title={alumnoNombre || "Registro de horas"}
      onClose={onClose}
      size="lg"
      footer={
        detail && canReview ? (
          <div className={detailStyles.footerActions}>
            {canValidateHora(detail.estatus) ? (
              <Button
                type="button"
                variant="success"
                disabled={isMutating}
                onClick={() => void run("validate")}
              >
                {isMutating ? "Procesando…" : "Validar"}
              </Button>
            ) : null}
            {canObserveHora(detail.estatus) ? (
              <Button
                type="button"
                variant="outline"
                disabled={isMutating}
                onClick={() => void run("observe")}
              >
                Pedir corrección
              </Button>
            ) : null}
            {canRejectHora(detail.estatus) ? (
              <Button
                type="button"
                variant="outline"
                className={detailStyles.dangerButton}
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
                className={detailStyles.neutralButton}
                disabled={isMutating}
                onClick={() => void run("cancel")}
              >
                Cancelar
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[detailStyles.layout, detailStyles.modalBody, isReloading && detailStyles.layoutBusy]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          <DetailModalHero
            icon={Clock3}
            title={alumnoNombre || "Sin alumno registrado"}
            subtitle={`${procesoLabel} · ${formatFecha(detail.fecha) || "Sin fecha registrada"}`}
            badges={<EstatusBadge estatus={detail.estatus} />}
          />

          <dl className={detailStyles.metaList}>
            <div className={detailStyles.metaRow}>
              <dt>Fecha del registro</dt>
              <dd>{formatFecha(detail.fecha) || "Sin fecha registrada"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Horas registradas</dt>
              <dd>{formatHorasRegistradas(detail.horasRegistradas)}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Entrada</dt>
              <dd>{formatHoraValue(detail.horaEntrada)}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Salida</dt>
              <dd>{formatHoraValue(detail.horaSalida)}</dd>
            </div>
          </dl>

          <div className={detailStyles.narrativeSection}>
            <p className={detailStyles.narrativeLabel}>Actividades realizadas</p>
            <p
              className={[
                detailStyles.narrativeValue,
                !descripcion && detailStyles.narrativeEmpty,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {descripcion || "El alumno no registró una descripción de actividades."}
            </p>
          </div>

          {canReview ? (
            <section
              className={detailStyles.contentPanel}
              aria-labelledby="hora-revision-title"
            >
              <div className={detailStyles.panelHeader}>
                <h3 id="hora-revision-title" className={detailStyles.panelTitle}>
                  Revisar registro
                </h3>
                <p className={detailStyles.panelDescription}>
                  Valida el registro si es correcto. Si falta información en las actividades, pide
                  corrección para que el alumno las ajuste. Rechaza solo si no procede.{" "}
                  {HORA_OBSERVAR_SOLO_ACTIVIDADES_DELEGACION}
                </p>
              </div>

              <FormField
                id="hora-comentario"
                label="Comentario"
                hint="Opcional al validar. Obligatorio al pedir corrección o rechazar. Indica qué debe corregir en las actividades."
              >
                <textarea
                  id="hora-comentario"
                  className={formStyles.textarea}
                  rows={3}
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                />
              </FormField>
            </section>
          ) : (
            <section className={detailStyles.contentPanel}>
              <p className={detailStyles.panelDescription}>
                Este registro ya fue revisado y no admite más acciones.
              </p>
            </section>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
