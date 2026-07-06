"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
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
import { formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import {
  canObserveHora,
  canRejectHora,
  canValidateHora,
  validarRegistroHoraAlumno,
} from "@/lib/domain/horas";
import {
  canEmitirLiberacionTecnica,
  canRegistrarEvaluacionFinal,
  canRegistrarHoraProceso,
  canRegistrarIncidenciaProceso,
  formatHorasProceso,
} from "@/lib/domain/proceso";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import sharedStyles from "@/shared/styles/EntityDetailModal.module.css";
import heroStyles from "../vacantes/TitularVacanteDetailModal.module.css";
import procesoStyles from "./TitularProcesoDetailModal.module.css";
import {
  TITULAR_PROCESO_SECTION_LABELS,
  type TitularProcesoModalSection,
} from "./titular-proceso-sections";

function getSectionAside(
  section: TitularProcesoModalSection,
  incidenciasCount: number,
  horasLabel: string,
) {
  if (section === "horas" || section === "liberacion" || section === "evaluacion") {
    return { label: "Avance", value: horasLabel };
  }

  if (section === "incidencias") {
    return {
      label: "Registradas",
      value: incidenciasCount === 1 ? "1 incidencia" : `${incidenciasCount} incidencias`,
    };
  }

  return null;
}

export function TitularProcesoDetailModal({
  procesoId,
  section,
  open,
  onClose,
}: {
  procesoId: number | null;
  section: TitularProcesoModalSection | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = usePanelRouter();
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
  const [evaluacion, setEvaluacion] = useState({
    estatus: "APROBADA",
    calificacion: "",
    comentario: "",
  });
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    procesoId,
    getProcesoDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setActionError(null);
        setComentario("");
        setNuevaHora({
          fecha: "",
          horaEntrada: "",
          horaSalida: "",
          descripcionActividades: "",
        });
        setNuevaIncidencia({
          tipo: "",
          severidad: "",
          descripcion: "",
          fechaIncidencia: "",
        });
        setEvaluacion({ estatus: "APROBADA", calificacion: "", comentario: "" });
      },
    },
  );

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const proceso = detail?.proceso;
  const alumnoNombre = proceso?.alumnoNombre?.trim();
  const vacanteNombre = proceso?.vacanteNombre?.trim();
  const horasLabel = proceso
    ? formatHorasProceso(proceso.horasAcumuladas, proceso.horasRequeridas, "detalle")
    : "—";
  const sectionLabel = section ? TITULAR_PROCESO_SECTION_LABELS[section] : "Proceso";
  const horasRegistradas = detail?.horas ?? [];
  const incidenciasRegistradas = detail?.incidencias ?? [];
  const hasActionableHoras = horasRegistradas.some(
    (hora) =>
      canValidateHora(hora.estatus) ||
      canObserveHora(hora.estatus) ||
      canRejectHora(hora.estatus),
  );
  const sectionAside = section
    ? getSectionAside(section, incidenciasRegistradas.length, horasLabel)
    : null;

  const runHoraAction = async (
    action: "validate" | "observe" | "reject",
    idAsistencia: number,
  ) => {
    if (!proceso) {
      return;
    }

    setIsMutating(true);
    setActionError(null);
    const idProceso = proceso.idProceso;
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(
            idProceso,
            idAsistencia,
            comentario.trim() ? { comentario: comentario.trim() } : {},
          )
        : action === "observe"
          ? await observeProcesoHoraAction(idProceso, idAsistencia, {
              comentario: comentario.trim() || "Observación registrada.",
            })
          : await rejectProcesoHoraAction(idProceso, idAsistencia, {
              comentario: comentario.trim() || "Registro rechazado.",
            });

    setIsMutating(false);

    if (!result.success) {
      setActionError(result.error);
      return;
    }

    setComentario("");
    refresh();
  };

  return (
    <Modal
      open={open}
      title={sectionLabel}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={1} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {proceso && section ? (
        <div
          className={[
            sharedStyles.layout,
            heroStyles.modalBody,
            isReloading && sharedStyles.layoutBusy,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={procesoStyles.sectionContext}>
            <div className={procesoStyles.sectionContextMain}>
              <p className={procesoStyles.sectionContextName}>
                {alumnoNombre || "Sin alumno registrado"}
              </p>
              <p className={procesoStyles.sectionContextMeta}>
                {vacanteNombre || "Sin vacante"}
              </p>
            </div>
            {sectionAside ? (
              <div className={procesoStyles.sectionContextAside}>
                <span className={procesoStyles.sectionContextAsideLabel}>
                  {sectionAside.label}
                </span>
                <strong>{sectionAside.value}</strong>
              </div>
            ) : null}
          </div>

          {section === "horas" ? (
          <>
            {horasRegistradas.length === 0 ? (
              <p className={procesoStyles.emptyHint}>No hay horas registradas.</p>
            ) : (
              <ul className={procesoStyles.recordList}>
                {horasRegistradas.map((hora) => {
                  const canAct =
                    canValidateHora(hora.estatus) ||
                    canObserveHora(hora.estatus) ||
                    canRejectHora(hora.estatus);

                  return (
                    <li key={hora.idAsistencia} className={procesoStyles.horaCard}>
                      <div className={procesoStyles.horaCardBody}>
                        <div className={procesoStyles.horaCardMeta}>
                          <span className={procesoStyles.horaCardDate}>
                            {hora.fecha ? formatFecha(hora.fecha) : "Sin fecha"}
                          </span>
                          {hora.horasRegistradas !== undefined ? (
                            <span className={procesoStyles.horaCardHours}>
                              {hora.horasRegistradas} h registradas
                            </span>
                          ) : null}
                        </div>
                        <EstatusBadge estatus={hora.estatus} />
                      </div>
                      {canAct ? (
                        <div className={procesoStyles.horaCardActions}>
                          {canValidateHora(hora.estatus) ? (
                            <Button
                              type="button"
                              variant="primary"
                              disabled={isMutating}
                              onClick={() => void runHoraAction("validate", hora.idAsistencia)}
                            >
                              Validar
                            </Button>
                          ) : null}
                          {canObserveHora(hora.estatus) ? (
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isMutating}
                              onClick={() => void runHoraAction("observe", hora.idAsistencia)}
                            >
                              Observar
                            </Button>
                          ) : null}
                          {canRejectHora(hora.estatus) ? (
                            <Button
                              type="button"
                              variant="outline"
                              className={sharedStyles.dangerButton}
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
            )}

            {hasActionableHoras ? (
              <FormField
                id="comentario-hora"
                label="Comentario (opcional para validar, observar o rechazar)"
              >
                <textarea
                  id="comentario-hora"
                  className={formStyles.textarea}
                  rows={2}
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                />
              </FormField>
            ) : null}
          </>
          ) : null}

          {section === "horas" && proceso && canRegistrarHoraProceso(proceso.estatus) ? (
          <div className={procesoStyles.registerPanel} aria-label="Registrar hora interna">
            <div className={procesoStyles.registerPanelHeader}>
              <h3 className={procesoStyles.registerPanelTitle}>Registrar hora interna</h3>
              <p className={procesoStyles.registerPanelDescription}>
                Captura asistencia directamente desde el área.
              </p>
            </div>

            <div className={procesoStyles.timeGrid}>
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

            <TextInput
              id="hora-actividades"
              label="Actividades realizadas"
              required
              value={nuevaHora.descripcionActividades}
              onChange={(event) =>
                setNuevaHora((current) => ({
                  ...current,
                  descripcionActividades: event.target.value,
                }))
              }
            />

            <div className={procesoStyles.registerPanelActions}>
              <Button
                type="button"
                variant="success"
                disabled={isMutating}
                onClick={async () => {
                  const validationError = validarRegistroHoraAlumno(nuevaHora);
                  if (validationError) {
                    setActionError(validationError);
                    return;
                  }

                  setIsMutating(true);
                  setActionError(null);
                  const result = await registerProcesoHoraAction(proceso.idProceso, {
                    fecha: nuevaHora.fecha,
                    horaEntrada: nuevaHora.horaEntrada,
                    horaSalida: nuevaHora.horaSalida,
                    descripcionActividades: nuevaHora.descripcionActividades.trim(),
                  });
                  setIsMutating(false);

                  if (!result.success) {
                    setActionError(result.error);
                    return;
                  }

                  refresh();
                }}
              >
                Registrar hora
              </Button>
            </div>
          </div>
          ) : null}
          {section === "incidencias" ? (
          <>
            {incidenciasRegistradas.length === 0 ? (
              <p className={procesoStyles.emptyHint}>No hay incidencias registradas.</p>
            ) : (
              <ul className={procesoStyles.recordList}>
                {incidenciasRegistradas.map((incidencia) => (
                  <li key={incidencia.idIncidencia} className={procesoStyles.recordCard}>
                    <div className={procesoStyles.recordHeader}>
                      <span className={procesoStyles.recordTitle}>
                        {formatEtiqueta(incidencia.tipo, "Incidencia")}
                      </span>
                      <EstatusBadge estatus={incidencia.estatus} />
                    </div>
                    {incidencia.severidad ? (
                      <div className={procesoStyles.recordDetails}>
                        <span>Severidad: {formatEtiqueta(incidencia.severidad)}</span>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </>
          ) : null}

          {section === "incidencias" && proceso && canRegistrarIncidenciaProceso(proceso.estatus) ? (
          <div className={procesoStyles.registerPanel} aria-label="Registrar incidencia">
            <div className={procesoStyles.registerPanelHeader}>
              <h3 className={procesoStyles.registerPanelTitle}>Nueva incidencia</h3>
              <p className={procesoStyles.registerPanelDescription}>
                Documenta un evento relevante durante el seguimiento.
              </p>
            </div>

            <div className={procesoStyles.fieldGrid}>
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

            <FormField id="inc-descripcion" label="Descripción" required>
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

            <div className={procesoStyles.registerPanelActions}>
              <Button
                type="button"
                variant="success"
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
                  setActionError(null);
                  const result = await registerProcesoIncidenciaAction(proceso.idProceso, {
                    tipo: nuevaIncidencia.tipo.trim(),
                    severidad: nuevaIncidencia.severidad.trim(),
                    descripcion: nuevaIncidencia.descripcion.trim(),
                    fechaIncidencia: nuevaIncidencia.fechaIncidencia,
                  });
                  setIsMutating(false);

                  if (!result.success) {
                    setActionError(result.error);
                    return;
                  }

                  refresh();
                }}
              >
                Registrar incidencia
              </Button>
            </div>
          </div>
          ) : null}

          {section === "liberacion" ? (
          <>
            {detail?.liberacionTecnica ? (
              <div className={procesoStyles.stateNotice}>
                <strong>Liberación técnica registrada</strong>
                <span>Ya existe un registro de liberación técnica para este proceso.</span>
              </div>
            ) : canEmitirLiberacionTecnica(
                proceso.estatus,
                detail?.evaluacionFinal,
                detail?.liberacionTecnica,
              ) ? (
              <div className={procesoStyles.registerPanel} aria-label="Emitir liberación técnica">
                <div className={procesoStyles.registerPanelHeader}>
                  <h3 className={procesoStyles.registerPanelTitle}>Emitir liberación técnica</h3>
                  <p className={procesoStyles.registerPanelDescription}>
                    Confirma que el alumno cumple los requisitos del área.
                  </p>
                </div>

                <FormField id="comentario-liberacion" label="Comentario (opcional)">
                  <textarea
                    id="comentario-liberacion"
                    className={formStyles.textarea}
                    rows={2}
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                  />
                </FormField>

                <div className={procesoStyles.registerPanelActions}>
                  <Button
                    type="button"
                    variant="success"
                    disabled={isMutating}
                    onClick={async () => {
                      setIsMutating(true);
                      setActionError(null);
                      const liberacionPayload =
                        comentario.trim() ? { comentario: comentario.trim() } : {};
                      const result = await emitProcesoLiberacionTecnicaAction(
                        proceso.idProceso,
                        liberacionPayload,
                      );
                      setIsMutating(false);

                      if (!result.success) {
                        setActionError(result.error);
                        return;
                      }

                      refresh();
                    }}
                  >
                    Emitir liberación técnica
                  </Button>
                </div>
              </div>
            ) : (
              <p className={procesoStyles.emptyHint}>
                Requiere evaluación final aprobada y horas completas del proceso.
              </p>
            )}
          </>
          ) : null}

          {section === "evaluacion" ? (
          <>
            {detail?.evaluacionFinal ? (
              <div className={procesoStyles.stateNotice}>
                <strong>Evaluación final registrada</strong>
                <span>La evaluación final ya fue capturada para este proceso.</span>
              </div>
            ) : canRegistrarEvaluacionFinal(proceso.estatus, detail?.evaluacionFinal) ? (
              <div className={procesoStyles.registerPanel} aria-label="Registrar evaluación final">
                <div className={procesoStyles.registerPanelHeader}>
                  <h3 className={procesoStyles.registerPanelTitle}>Calificación final</h3>
                  <p className={procesoStyles.registerPanelDescription}>
                    Registra el desempeño del alumno al concluir el servicio.
                  </p>
                </div>

                <div className={procesoStyles.fieldGrid}>
                  <FormField id="eval-estatus" label="Estatus de evaluación" required>
                    <select
                      id="eval-estatus"
                      className={formStyles.select}
                      value={evaluacion.estatus}
                      onChange={(event) =>
                        setEvaluacion((current) => ({
                          ...current,
                          estatus: event.target.value,
                        }))
                      }
                    >
                      <option value="APROBADA">Aprobada</option>
                      <option value="NO_APROBADA">No aprobada</option>
                      <option value="OBSERVADA">Observada</option>
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
                      setEvaluacion((current) => ({
                        ...current,
                        calificacion: event.target.value,
                      }))
                    }
                  />
                  <TextInput
                    id="eval-comentario"
                    label="Comentario (opcional)"
                    value={evaluacion.comentario}
                    onChange={(event) =>
                      setEvaluacion((current) => ({
                        ...current,
                        comentario: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className={procesoStyles.registerPanelActions}>
                  <Button
                    type="button"
                    variant="success"
                    disabled={isMutating}
                    onClick={async () => {
                      const calificacion = Number(evaluacion.calificacion);
                      if (!evaluacion.calificacion.trim() || Number.isNaN(calificacion)) {
                        setActionError("Indica la calificación.");
                        return;
                      }

                      setIsMutating(true);
                      setActionError(null);
                      const evalPayload: {
                        estatus: string;
                        calificacion: number;
                        comentario?: string;
                      } = {
                        estatus: evaluacion.estatus,
                        calificacion,
                      };
                      if (evaluacion.comentario.trim()) {
                        evalPayload.comentario = evaluacion.comentario.trim();
                      }
                      const result = await registerProcesoEvaluacionFinalAction(
                        proceso.idProceso,
                        evalPayload,
                      );
                      setIsMutating(false);

                      if (!result.success) {
                        setActionError(result.error);
                        return;
                      }

                      refresh();
                    }}
                  >
                    Registrar evaluación
                  </Button>
                </div>
              </div>
            ) : (
              <p className={procesoStyles.emptyHint}>
                Disponible cuando el proceso tenga las horas completas.
              </p>
            )}
          </>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
