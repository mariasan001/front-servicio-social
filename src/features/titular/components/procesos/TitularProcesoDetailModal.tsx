"use client";

import { FileText } from "lucide-react";
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
import type { ProcesoDetalleResponse } from "../../types/titular.types";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
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
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import formLayoutStyles from "@/shared/styles/PanelFormModal.module.css";
import procesoStyles from "./TitularProcesoDetailModal.module.css";
import {
  TITULAR_PROCESO_SECTION_LABELS,
  type TitularProcesoModalSection,
} from "./titular-proceso-sections";

function getContextItems(section: TitularProcesoModalSection, proceso: ProcesoDetalleResponse) {
  const alumno = proceso.alumnoNombre?.trim() || "Sin nombre";
  const vacante = proceso.vacanteNombre?.trim() || "Sin vacante";
  const horas = formatHorasProceso(proceso.horasAcumuladas, proceso.horasRequeridas, "detalle");
  const estatus = formatEtiqueta(proceso.estatus);

  if (section === "horas" || section === "liberacion") {
    return [
      { label: "Alumno", value: alumno },
      { label: "Horas", value: horas },
    ];
  }

  if (section === "incidencias") {
    return [
      { label: "Alumno", value: alumno },
      { label: "Vacante", value: vacante },
    ];
  }

  return [
    { label: "Alumno", value: alumno },
    { label: "Estatus", value: estatus },
  ];
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
  const folio = proceso?.folio?.trim();
  const sectionLabel = section ? TITULAR_PROCESO_SECTION_LABELS[section] : "Proceso";
  const contextItems = proceso && section ? getContextItems(section, proceso) : [];

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
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <FileText size={18} strokeWidth={1.75} />
            </div>

            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{alumnoNombre || "Sin alumno registrado"}</p>
              <p className={styles.summarySecondary}>{folio || "Sin folio registrado"}</p>
            </div>

            <StatusBadge tone={estatusTone(proceso.estatus)}>
              {formatEtiqueta(proceso.estatus)}
            </StatusBadge>
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              {contextItems.map((item) => (
                <div key={item.label} className={styles.infoItem}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
              <div className={styles.infoItem}>
                <dt>Proceso</dt>
                <dd>{folio || "Sin folio"}</dd>
              </div>
            </dl>
          </div>

          {section === "horas" ? (
          <section className={styles.section} aria-label="Registros de horas">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Pendientes de revisión</h3>
              <p className={styles.sectionDescription}>
                Valida, observa o rechaza los registros enviados por el alumno.
              </p>
            </div>

            <div className={formLayoutStyles.formLayout}>
              <FormField id="comentario-hora" label="Comentario para acciones sobre horas">
                <textarea
                  id="comentario-hora"
                  className={formStyles.textarea}
                  rows={2}
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                />
              </FormField>

              {(detail?.horas ?? []).length === 0 ? (
                <p className={procesoStyles.emptyHint}>No hay horas registradas.</p>
              ) : (
                <ul className={procesoStyles.recordList}>
                  {detail?.horas.map((hora) => (
                    <li key={hora.idAsistencia} className={procesoStyles.recordCard}>
                      <div className={procesoStyles.recordHeader}>
                        <span className={procesoStyles.recordTitle}>
                          {hora.fecha ? formatFecha(hora.fecha) : "Sin fecha"}
                        </span>
                        <StatusBadge tone={estatusTone(hora.estatus)}>
                          {formatEtiqueta(hora.estatus)}
                        </StatusBadge>
                      </div>
                      {hora.horasRegistradas !== undefined ? (
                        <p className={procesoStyles.recordMeta}>
                          {hora.horasRegistradas} h registradas
                        </p>
                      ) : null}
                      <div className={procesoStyles.recordActions}>
                        {canValidateHora(hora.estatus) ? (
                        <Button
                          type="button"
                          variant="outline"
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
                          className={styles.dangerButton}
                          disabled={isMutating}
                          onClick={() => void runHoraAction("reject", hora.idAsistencia)}
                        >
                          Rechazar
                        </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          ) : null}

          {section === "horas" && proceso && canRegistrarHoraProceso(proceso.estatus) ? (
          <section className={styles.section} aria-label="Registrar hora interna">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Registrar hora interna</h3>
              <p className={styles.sectionDescription}>
                Captura asistencia directamente desde el área, sin depender del alumno.
              </p>
            </div>

            <div className={formLayoutStyles.formLayout}>
              <div className={formLayoutStyles.formGrid}>
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
                <div className={formLayoutStyles.formGridFull}>
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
                </div>
              </div>
              <div className={formLayoutStyles.formActions}>
                <Button
                  type="button"
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
          </section>
          ) : null}

          {section === "incidencias" ? (
          <section className={styles.section} aria-label="Incidencias del proceso">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Incidencias</h3>
              <p className={styles.sectionDescription}>
                Consulta las incidencias registradas en este proceso.
              </p>
            </div>

            {(detail?.incidencias ?? []).length === 0 ? (
              <p className={procesoStyles.emptyHint}>No hay incidencias registradas.</p>
            ) : (
              <ul className={procesoStyles.recordList}>
                {detail?.incidencias.map((incidencia) => (
                  <li key={incidencia.idIncidencia} className={procesoStyles.recordCard}>
                    <div className={procesoStyles.recordHeader}>
                      <span className={procesoStyles.recordTitle}>
                        {formatEtiqueta(incidencia.tipo, "Incidencia")}
                      </span>
                      <StatusBadge tone={estatusTone(incidencia.estatus)}>
                        {formatEtiqueta(incidencia.estatus)}
                      </StatusBadge>
                    </div>
                    {incidencia.severidad ? (
                      <p className={procesoStyles.recordMeta}>
                        Severidad: {formatEtiqueta(incidencia.severidad)}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
          ) : null}

          {section === "incidencias" && proceso && canRegistrarIncidenciaProceso(proceso.estatus) ? (
          <section className={styles.section} aria-label="Registrar incidencia">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Registrar incidencia</h3>
              <p className={styles.sectionDescription}>
                Documenta un evento relevante durante el seguimiento del alumno.
              </p>
            </div>

            <div className={formLayoutStyles.formLayout}>
              <div className={formLayoutStyles.formGrid}>
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
                <div className={formLayoutStyles.formGridFull}>
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
              <div className={formLayoutStyles.formActions}>
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
          </section>
          ) : null}

          {section === "liberacion" ? (
          <section className={styles.section} aria-label="Liberación técnica">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Liberación técnica</h3>
              <p className={styles.sectionDescription}>
                Emite la liberación técnica cuando el alumno cumple los requisitos del área.
              </p>
            </div>

            {detail?.liberacionTecnica ? (
              <div className={styles.successBox}>
                <strong>Liberación técnica registrada</strong>
                <span className={styles.successValue}>
                  Ya existe un registro de liberación técnica para este proceso.
                </span>
              </div>
            ) : canEmitirLiberacionTecnica(
                proceso.estatus,
                detail?.evaluacionFinal,
                detail?.liberacionTecnica,
              ) ? (
              <div className={formLayoutStyles.formLayout}>
                <FormField id="comentario-liberacion" label="Comentario (opcional)">
                  <textarea
                    id="comentario-liberacion"
                    className={formStyles.textarea}
                    rows={2}
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                  />
                </FormField>
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
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
                La liberación técnica requiere evaluación final aprobada y proceso con horas
                completas.
              </p>
            )}
          </section>
          ) : null}

          {section === "evaluacion" ? (
          <section className={styles.section} aria-label="Evaluación final">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Evaluación final</h3>
              <p className={styles.sectionDescription}>
                Registra la calificación final del desempeño del alumno.
              </p>
            </div>

            {detail?.evaluacionFinal ? (
              <div className={styles.successBox}>
                <strong>Evaluación final registrada</strong>
                <span className={styles.successValue}>
                  La evaluación final ya fue capturada para este proceso.
                </span>
              </div>
            ) : canRegistrarEvaluacionFinal(proceso.estatus, detail?.evaluacionFinal) ? (
              <div className={formLayoutStyles.formLayout}>
                <div className={formLayoutStyles.formGrid}>
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
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
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
                La evaluación final solo está disponible cuando el proceso tiene las horas
                completas.
              </p>
            )}
          </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
