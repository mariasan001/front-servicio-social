"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  emitProcesoLiberacionTecnicaAction,
  getProcesoDetailAction,
  observeProcesoHoraAction,
  registerProcesoEvaluacionFinalAction,
  registerProcesoHoraAction,
  registerProcesoIncidenciaAction,
  rejectProcesoHoraAction,
  validateProcesoHoraAction,
} from "../../actions/procesos.actions";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelDetailView.module.css";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";

export function TitularProcesoDetailModal({
  procesoId,
  open,
  onClose,
}: {
  procesoId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [comentario, setComentario] = useState("");
  const [nuevaHora, setNuevaHora] = useState({
    fecha: "",
    horaEntrada: "",
    horaSalida: "",
    descripcionActividades: "",
  });
  const [nuevaIncidencia, setNuevaIncidencia] = useState({
    tipo: "",
    severidad: "",
    descripcion: "",
    fechaIncidencia: "",
  });
  const [evaluacion, setEvaluacion] = useState({ calificacion: "", comentarioTitular: "" });
  const { detail, error, isLoading } = useDetailModalLoader(
    open,
    procesoId,
    getProcesoDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setActionError(null);
      },
    },
  );

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const proceso = detail?.proceso;

  const runHoraAction = async (
    action: "validate" | "observe" | "reject",
    idAsistencia: number,
  ) => {
    if (!proceso) return;
    setIsMutating(true);
    setActionError(null);
    const idProceso = proceso.idProceso;
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(
            idProceso,
            idAsistencia,
            comentario.trim() ? { comentarioTitular: comentario.trim() } : {},
          )
        : action === "observe"
          ? await observeProcesoHoraAction(idProceso, idAsistencia, {
              comentarioTitular: comentario.trim() || "Observación registrada.",
            })
          : await rejectProcesoHoraAction(idProceso, idAsistencia, {
              comentarioTitular: comentario.trim() || "Registro rechazado.",
            });
    setIsMutating(false);
    if (!result.success) setActionError(result.error);
    else {
      setComentario("");
      refresh();
    }
  };

  return (
    <Modal
      open={open}
      title={proceso?.folio ? `Proceso ${proceso.folio}` : "Proceso"}
      onClose={onClose}
      size="lg"
    >
      {isLoading ? <LoadingState label="Cargando proceso…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      {!isLoading && proceso ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(proceso.estatus)}>
            {formatEtiqueta(proceso.estatus)}
          </StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>Alumno</dt>
              <dd>{proceso.alumnoNombre ?? "Sin nombre"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Horas</dt>
              <dd>
                {proceso.horasAcumuladas ?? 0} de {proceso.horasRequeridas ?? "—"} requeridas
              </dd>
            </div>
          </dl>

          <FormField id="comentario-hora" label="Comentario para acciones sobre horas">
            <textarea
              id="comentario-hora"
              className={formStyles.textarea}
              rows={2}
              value={comentario}
              onChange={(event) => setComentario(event.target.value)}
            />
          </FormField>

          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Registros de horas</h3>
            {(detail?.horas ?? []).length === 0 ? (
              <p className={styles.emptyInline}>No hay horas registradas.</p>
            ) : (
              <ul className={styles.panelList}>
                {detail?.horas.map((hora) => (
                  <li key={hora.idAsistencia} className={styles.panelCard}>
                    <strong>{hora.fecha ?? "Sin fecha"}</strong>
                    <StatusBadge tone={estatusTone(hora.estatus)}>
                      {formatEtiqueta(hora.estatus)}
                    </StatusBadge>
                    <div className={styles.detailActions}>
                      <Button
                        type="button"
                        variant="outline"
                        className={styles.actionButton}
                        disabled={isMutating}
                        onClick={() => void runHoraAction("validate", hora.idAsistencia)}
                      >
                        Validar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={styles.actionButton}
                        disabled={isMutating}
                        onClick={() => void runHoraAction("observe", hora.idAsistencia)}
                      >
                        Observar
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className={styles.actionButton}
                        disabled={isMutating}
                        onClick={() => void runHoraAction("reject", hora.idAsistencia)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className={styles.inlineForm}>
            <h3 className={styles.detailSectionTitle}>Registrar hora interna</h3>
            <div className={styles.formGrid}>
              <TextInput
                id="hora-fecha"
                label="Fecha"
                type="date"
                value={nuevaHora.fecha}
                onChange={(event) =>
                  setNuevaHora((current) => ({ ...current, fecha: event.target.value }))
                }
              />
              <TextInput
                id="hora-entrada"
                label="Hora entrada"
                type="time"
                value={nuevaHora.horaEntrada}
                onChange={(event) =>
                  setNuevaHora((current) => ({ ...current, horaEntrada: event.target.value }))
                }
              />
              <TextInput
                id="hora-salida"
                label="Hora salida"
                type="time"
                value={nuevaHora.horaSalida}
                onChange={(event) =>
                  setNuevaHora((current) => ({ ...current, horaSalida: event.target.value }))
                }
              />
            </div>
            <Button
              type="button"
              disabled={isMutating}
              onClick={async () => {
                if (!nuevaHora.fecha || !nuevaHora.horaEntrada || !nuevaHora.horaSalida) {
                  setActionError("Completa fecha y horario para registrar la hora.");
                  return;
                }
                setIsMutating(true);
                const result = await registerProcesoHoraAction(proceso.idProceso, {
                  fecha: nuevaHora.fecha,
                  horaEntrada: nuevaHora.horaEntrada,
                  horaSalida: nuevaHora.horaSalida,
                  descripcionActividades: nuevaHora.descripcionActividades.trim() || undefined,
                });
                setIsMutating(false);
                if (!result.success) setActionError(result.error);
                else refresh();
              }}
            >
              Registrar hora
            </Button>
          </div>

          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Incidencias del proceso</h3>
            {(detail?.incidencias ?? []).length === 0 ? (
              <p className={styles.emptyInline}>No hay incidencias registradas.</p>
            ) : (
              <ul className={styles.panelList}>
                {detail?.incidencias.map((incidencia) => (
                  <li key={incidencia.idIncidencia} className={styles.panelCard}>
                    <strong>{formatEtiqueta(incidencia.tipo)}</strong>
                    <StatusBadge tone={estatusTone(incidencia.estatus)}>
                      {formatEtiqueta(incidencia.estatus)}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className={styles.inlineForm}>
            <h3 className={styles.detailSectionTitle}>Registrar incidencia</h3>
            <div className={styles.formGrid}>
              <TextInput
                id="inc-tipo"
                label="Tipo"
                value={nuevaIncidencia.tipo}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({ ...current, tipo: event.target.value }))
                }
              />
              <TextInput
                id="inc-severidad"
                label="Severidad"
                value={nuevaIncidencia.severidad}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({ ...current, severidad: event.target.value }))
                }
              />
              <TextInput
                id="inc-fecha"
                label="Fecha"
                type="date"
                value={nuevaIncidencia.fechaIncidencia}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({
                    ...current,
                    fechaIncidencia: event.target.value,
                  }))
                }
              />
            </div>
            <FormField id="inc-descripcion" label="Descripción">
              <textarea
                id="inc-descripcion"
                className={formStyles.textarea}
                rows={2}
                value={nuevaIncidencia.descripcion}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({
                    ...current,
                    descripcion: event.target.value,
                  }))
                }
              />
            </FormField>
            <Button
              type="button"
              variant="outline"
              disabled={isMutating}
              onClick={async () => {
                if (
                  !nuevaIncidencia.tipo.trim() ||
                  !nuevaIncidencia.severidad.trim() ||
                  !nuevaIncidencia.descripcion.trim() ||
                  !nuevaIncidencia.fechaIncidencia
                ) {
                  setActionError("Completa todos los campos de la incidencia.");
                  return;
                }
                setIsMutating(true);
                const result = await registerProcesoIncidenciaAction(proceso.idProceso, {
                  tipo: nuevaIncidencia.tipo.trim(),
                  severidad: nuevaIncidencia.severidad.trim(),
                  descripcion: nuevaIncidencia.descripcion.trim(),
                  fechaIncidencia: nuevaIncidencia.fechaIncidencia,
                });
                setIsMutating(false);
                if (!result.success) setActionError(result.error);
                else refresh();
              }}
            >
              Registrar incidencia
            </Button>
          </div>

          <div className={styles.inlineForm}>
            <h3 className={styles.detailSectionTitle}>Liberación técnica</h3>
            {detail?.liberacionTecnica ? (
              <p className={styles.detailLead}>Ya existe un registro de liberación técnica.</p>
            ) : (
              <Button
                type="button"
                disabled={isMutating}
                onClick={async () => {
                  setIsMutating(true);
                  const result = await emitProcesoLiberacionTecnicaAction(proceso.idProceso, {
                    comentarioTitular: comentario.trim() || undefined,
                  });
                  setIsMutating(false);
                  if (!result.success) setActionError(result.error);
                  else refresh();
                }}
              >
                Emitir liberación técnica
              </Button>
            )}
          </div>

          <div className={styles.inlineForm}>
            <h3 className={styles.detailSectionTitle}>Evaluación final</h3>
            {detail?.evaluacionFinal ? (
              <p className={styles.detailLead}>La evaluación final ya fue registrada.</p>
            ) : (
              <>
                <TextInput
                  id="eval-calificacion"
                  label="Calificación"
                  type="number"
                  min={0}
                  max={100}
                  value={evaluacion.calificacion}
                  onChange={(event) =>
                    setEvaluacion((current) => ({
                      ...current,
                      calificacion: event.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  disabled={isMutating}
                  onClick={async () => {
                    const calificacion = Number(evaluacion.calificacion);
                    if (!calificacion && calificacion !== 0) {
                      setActionError("Indica la calificación.");
                      return;
                    }
                    setIsMutating(true);
                    const result = await registerProcesoEvaluacionFinalAction(proceso.idProceso, {
                      calificacion,
                      comentarioTitular: evaluacion.comentarioTitular.trim() || undefined,
                    });
                    setIsMutating(false);
                    if (!result.success) setActionError(result.error);
                    else refresh();
                  }}
                >
                  Registrar evaluación
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
