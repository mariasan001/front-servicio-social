"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  emitProcesoLiberacionTecnicaAction,
  getProcesoDetailAction,
  registerProcesoEvaluacionFinalAction,
  registerProcesoIncidenciaAction,
} from "../../actions/procesos.actions";
import { formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import {
  canEmitirLiberacionTecnica,
  canRegistrarEvaluacionFinal,
  canRegistrarHoraProceso,
  canRegistrarIncidenciaProceso,
  EVALUACION_FINAL_ESTATUS,
  EVALUACION_FINAL_ESTATUS_LABELS,
  formatHorasProceso,
  mensajeBloqueoEvaluacionFinal,
  mensajeBloqueoLiberacionTecnica,
} from "@/lib/domain/proceso";
import {
  INCIDENCIA_SEVERIDADES,
  INCIDENCIA_SEVERIDAD_LABELS,
  INCIDENCIA_TIPOS,
  INCIDENCIA_TIPO_LABELS,
} from "@/lib/domain/incidencia";
import { Alert } from "@/shared/components/Alert";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField, SelectInput, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import {
  TITULAR_PROCESO_SECTION_LABELS,
  type TitularProcesoModalSection,
} from "./titular-proceso-sections";
import { TitularProcesoHorasPanel } from "./TitularProcesoHorasPanel";

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
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [liberacionComentario, setLiberacionComentario] = useState("");
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
        setLiberacionComentario("");
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
  const sectionAside = section
    ? getSectionAside(section, incidenciasRegistradas.length, horasLabel)
    : null;

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
            detailStyles.layout,
            detailStyles.modalBody,
            isReloading && detailStyles.layoutBusy,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >

          <div className={sectionStyles.sectionContext}>
            <div className={sectionStyles.sectionContextMain}>
              <p className={sectionStyles.sectionContextName}>
                {alumnoNombre || "Sin alumno registrado"}
              </p>
              <p className={sectionStyles.sectionContextMeta}>
                {vacanteNombre || "Sin vacante"}
              </p>
            </div>
            {sectionAside ? (
              <div className={sectionStyles.sectionContextAside}>
                <span className={sectionStyles.sectionContextAsideLabel}>
                  {sectionAside.label}
                </span>
                <strong>{sectionAside.value}</strong>
              </div>
            ) : null}
          </div>

          {section === "horas" && proceso ? (
            <TitularProcesoHorasPanel
              horas={horasRegistradas}
              idProceso={proceso.idProceso}
              canRegister={canRegistrarHoraProceso(proceso.estatus)}
              onUpdated={refresh}
            />
          ) : null}

          {section === "incidencias" ? (
          <>
            {incidenciasRegistradas.length === 0 ? (
              <p className={sectionStyles.emptyHint}>No hay incidencias registradas.</p>
            ) : (
              <ul className={sectionStyles.recordList}>
                {incidenciasRegistradas.map((incidencia) => (
                  <li key={incidencia.idIncidencia} className={sectionStyles.recordCard}>
                    <div className={sectionStyles.recordHeader}>
                      <span className={sectionStyles.recordTitle}>
                        {formatEtiqueta(incidencia.tipo, "Incidencia")}
                      </span>
                      <EstatusBadge estatus={incidencia.estatus} />
                    </div>
                    {incidencia.severidad ? (
                      <div className={sectionStyles.recordDetails}>
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
          <div className={sectionStyles.registerPanel} aria-label="Registrar incidencia">
            <div className={sectionStyles.registerPanelHeader}>
              <h3 className={sectionStyles.registerPanelTitle}>Nueva incidencia</h3>
              <p className={sectionStyles.registerPanelDescription}>
                Documenta un evento relevante durante el seguimiento.
              </p>
            </div>

            <div className={sectionStyles.fieldGrid}>
              <SelectInput
                id="inc-tipo"
                label="Tipo"
                required
                placeholder="Selecciona un tipo"
                value={nuevaIncidencia.tipo}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({ ...current, tipo: event.target.value }))
                }
              >
                {INCIDENCIA_TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {INCIDENCIA_TIPO_LABELS[tipo]}
                  </option>
                ))}
              </SelectInput>
              <SelectInput
                id="inc-severidad"
                label="Severidad"
                required
                placeholder="Selecciona severidad"
                value={nuevaIncidencia.severidad}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({ ...current, severidad: event.target.value }))
                }
              >
                {INCIDENCIA_SEVERIDADES.map((severidad) => (
                  <option key={severidad} value={severidad}>
                    {INCIDENCIA_SEVERIDAD_LABELS[severidad]}
                  </option>
                ))}
              </SelectInput>
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

            <div className={sectionStyles.registerPanelActions}>
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
                    notify.error("Completa todos los campos de la incidencia.");
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

                  if (!result.success) {
                    notify.error(result.error);
                    return;
                  }

                  setNuevaIncidencia({
                    tipo: "",
                    severidad: "",
                    descripcion: "",
                    fechaIncidencia: "",
                  });
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
              <div className={sectionStyles.stateNotice}>
                <strong>Liberación técnica registrada</strong>
                <span>Ya existe un registro de liberación técnica para este proceso.</span>
              </div>
            ) : canEmitirLiberacionTecnica(
                proceso.estatus,
                detail?.evaluacionFinal,
                detail?.liberacionTecnica,
                proceso.horasAcumuladas,
                proceso.horasRequeridas,
              ) ? (
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
                    onChange={(event) => setLiberacionComentario(event.target.value)}
                  />
                </FormField>

                <div className={sectionStyles.registerPanelActions}>
                  <Button
                    type="button"
                    variant="success"
                    disabled={isMutating}
                    onClick={async () => {
                      setIsMutating(true);
                      const liberacionPayload =
                        liberacionComentario.trim()
                          ? { comentario: liberacionComentario.trim() }
                          : {};
                      const result = await emitProcesoLiberacionTecnicaAction(
                        proceso.idProceso,
                        liberacionPayload,
                      );
                      setIsMutating(false);

                      if (!result.success) {
                        notify.error(result.error);
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
              <p className={sectionStyles.emptyHint}>
                {mensajeBloqueoLiberacionTecnica(
                  proceso.estatus,
                  detail?.evaluacionFinal,
                  detail?.liberacionTecnica,
                  proceso.horasAcumuladas,
                  proceso.horasRequeridas,
                )}
              </p>
            )}
          </>
          ) : null}

          {section === "evaluacion" ? (
          <>
            {detail?.evaluacionFinal ? (
              <div className={sectionStyles.stateNotice}>
                <strong>Evaluación final registrada</strong>
                <span>La evaluación final ya fue capturada para este proceso.</span>
              </div>
            ) : canRegistrarEvaluacionFinal(
                proceso.estatus,
                detail?.evaluacionFinal,
                proceso.horasAcumuladas,
                proceso.horasRequeridas,
              ) ? (
              <div className={sectionStyles.registerPanel} aria-label="Registrar evaluación final">
                <div className={sectionStyles.registerPanelHeader}>
                  <h3 className={sectionStyles.registerPanelTitle}>Calificación final</h3>
                  <p className={sectionStyles.registerPanelDescription}>
                    Registra el desempeño del alumno al concluir el servicio.
                  </p>
                </div>

                <div className={sectionStyles.fieldGridTwo}>
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
                      {EVALUACION_FINAL_ESTATUS.map((estatus) => (
                        <option key={estatus} value={estatus}>
                          {EVALUACION_FINAL_ESTATUS_LABELS[estatus]}
                        </option>
                      ))}
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
                </div>

                <FormField id="eval-comentario" label="Comentario (opcional)">
                  <textarea
                    id="eval-comentario"
                    className={formStyles.textarea}
                    rows={3}
                    value={evaluacion.comentario}
                    onChange={(event) =>
                      setEvaluacion((current) => ({
                        ...current,
                        comentario: event.target.value,
                      }))
                    }
                  />
                </FormField>

                <div className={sectionStyles.registerPanelActions}>
                  <Button
                    type="button"
                    variant="success"
                    disabled={isMutating}
                    onClick={async () => {
                      const calificacion = Number(evaluacion.calificacion);
                      if (!evaluacion.calificacion.trim() || Number.isNaN(calificacion)) {
                        notify.error("Indica la calificación.");
                        return;
                      }

                      setIsMutating(true);
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
                        notify.error(result.error);
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
              <p className={sectionStyles.emptyHint}>
                {mensajeBloqueoEvaluacionFinal(
                  proceso.estatus,
                  detail?.evaluacionFinal,
                  proceso.horasAcumuladas,
                  proceso.horasRequeridas,
                )}
              </p>
            )}
          </>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
