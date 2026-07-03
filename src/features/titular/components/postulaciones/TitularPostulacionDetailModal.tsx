"use client";

import { UserRound } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  acceptPostulacionAction,
  getPostulacionDetailAction,
  markPostulacionExamFinishedAction,
  rejectPostulacionAction,
} from "../../actions/postulaciones.actions";
import {
  canAcceptPostulacion,
  canMarkPostulacionExam,
  canRejectPostulacion,
  isExamenFinalizado,
} from "../../lib/postulacion.utils";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
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
import narrativeStyles from "@/shared/styles/VacanteDetailNarrative.module.css";

export function TitularPostulacionDetailModal({
  postulacionId,
  open,
  onClose,
}: {
  postulacionId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = usePanelRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [comentario, setComentario] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [resultadoExamen, setResultadoExamen] = useState("");
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    postulacionId,
    getPostulacionDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setActionError(null);
        setComentario("");
        setMotivoRechazo("");
        setResultadoExamen("");
      },
    },
  );

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const estatus = detail?.estatus;
  const canAccept = canAcceptPostulacion(estatus);
  const canReject = canRejectPostulacion(estatus);
  const canMarkExam = canMarkPostulacionExam(estatus, detail?.requiereExamen, detail?.examenEstado);
  const examenListo = isExamenFinalizado(detail?.examenEstado);
  const alumnoNombre = detail?.alumnoNombre?.trim();
  const vacanteFolio = detail?.vacanteFolio?.trim();
  const vacanteNombre = detail?.vacanteNombre?.trim();
  const folio = detail?.folio?.trim();

  return (
    <Modal
      open={open}
      title={alumnoNombre || (folio ? `Postulación ${folio}` : "Postulación")}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <UserRound size={18} strokeWidth={1.75} />
            </div>

            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{alumnoNombre || "Sin nombre registrado"}</p>
              <p className={styles.summarySecondary}>{folio || "Sin folio registrado"}</p>
            </div>

            <StatusBadge tone={estatusTone(detail.estatus)}>
              {formatEtiqueta(detail.estatus, "Sin estatus")}
            </StatusBadge>
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>Alumno</dt>
                <dd>{alumnoNombre || "Sin nombre"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Vacante</dt>
                <dd>{vacanteNombre || vacanteFolio || "Sin vacante"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Fecha de postulación</dt>
                <dd>{formatFecha(detail.fechaPostulacion)}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Examen</dt>
                <dd>
                  {detail.requiereExamen ? (
                    <StatusBadge tone={estatusTone(detail.examenEstado)}>
                      {formatEtiqueta(detail.examenEstado, "Pendiente")}
                    </StatusBadge>
                  ) : (
                    "No aplica"
                  )}
                </dd>
              </div>
            </dl>

            {detail.resultadoExamen ? (
              <div className={narrativeStyles.narrativeBlock}>
                <p className={narrativeStyles.narrativeLabel}>Resultado del examen</p>
                <p className={narrativeStyles.narrativeValue}>{detail.resultadoExamen}</p>
              </div>
            ) : null}

            {detail.comentarioAlumno ? (
              <div className={narrativeStyles.narrativeBlock}>
                <p className={narrativeStyles.narrativeLabel}>Comentario del alumno</p>
                <p className={narrativeStyles.narrativeValue}>{detail.comentarioAlumno}</p>
              </div>
            ) : null}

            {detail.comentarioTitular ? (
              <div className={narrativeStyles.narrativeBlock}>
                <p className={narrativeStyles.narrativeLabel}>Tu comentario previo</p>
                <p className={narrativeStyles.narrativeValue}>{detail.comentarioTitular}</p>
              </div>
            ) : null}

            {detail.motivoRechazo ? (
              <div className={narrativeStyles.narrativeBlock}>
                <p className={narrativeStyles.narrativeLabel}>Motivo de rechazo</p>
                <p className={narrativeStyles.narrativeValue}>{detail.motivoRechazo}</p>
              </div>
            ) : null}
          </div>

          {canAccept ? (
            <section className={styles.section} aria-label="Aceptar postulación">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Aceptar postulación</h3>
                <p className={styles.sectionDescription}>
                  {examenListo
                    ? "El examen ya fue registrado. Acepta la postulación para abrir el proceso del alumno."
                    : "Aprueba la solicitud para continuar con el proceso de selección."}
                </p>
              </div>
              <div className={formLayoutStyles.formLayout}>
                <TextInput
                  id="comentario-aceptar"
                  label="Comentario (opcional)"
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                />
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    disabled={isMutating}
                    onClick={async () => {
                      setIsMutating(true);
                      setActionError(null);
                      const result = await acceptPostulacionAction(detail.idPostulacion, {
                        comentarioTitular: comentario.trim() || undefined,
                      });
                      setIsMutating(false);
                      if (!result.success) {
                        setActionError(result.error);
                        return;
                      }
                      refresh();
                    }}
                  >
                    {isMutating ? "Procesando…" : "Aceptar postulación"}
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          {canReject ? (
            <section className={styles.section} aria-label="Rechazar postulación">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Rechazar postulación</h3>
                <p className={styles.sectionDescription}>
                  Indica el motivo para notificar al alumno.
                </p>
              </div>
              <div className={formLayoutStyles.formLayout}>
                <FormField id="motivo-rechazo" label="Motivo de rechazo" required>
                  <textarea
                    id="motivo-rechazo"
                    className={formStyles.textarea}
                    rows={2}
                    value={motivoRechazo}
                    onChange={(event) => setMotivoRechazo(event.target.value)}
                  />
                </FormField>
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.dangerButton}
                    disabled={isMutating}
                    onClick={async () => {
                      if (!motivoRechazo.trim()) {
                        setActionError("Escribe el motivo de rechazo.");
                        return;
                      }
                      setIsMutating(true);
                      setActionError(null);
                      const result = await rejectPostulacionAction(detail.idPostulacion, {
                        motivoRechazo: motivoRechazo.trim(),
                        comentarioTitular: comentario.trim() || undefined,
                      });
                      setIsMutating(false);
                      if (!result.success) {
                        setActionError(result.error);
                        return;
                      }
                      refresh();
                    }}
                  >
                    Rechazar postulación
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          {canMarkExam ? (
            <section className={styles.section} aria-label="Registrar examen">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Registrar examen</h3>
                <p className={styles.sectionDescription}>
                  Captura el resultado del examen de ingreso del alumno.
                </p>
              </div>
              <div className={formLayoutStyles.formLayout}>
                <TextInput
                  id="resultado-examen"
                  label="Resultado del examen"
                  value={resultadoExamen}
                  onChange={(event) => setResultadoExamen(event.target.value)}
                />
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isMutating}
                    onClick={async () => {
                      if (!resultadoExamen.trim()) {
                        setActionError("Indica el resultado del examen.");
                        return;
                      }
                      setIsMutating(true);
                      setActionError(null);
                      const result = await markPostulacionExamFinishedAction(detail.idPostulacion, {
                        resultadoExamen: resultadoExamen.trim(),
                        comentarioTitular: comentario.trim() || undefined,
                      });
                      setIsMutating(false);
                      if (!result.success) {
                        setActionError(result.error);
                        return;
                      }
                      refresh();
                    }}
                  >
                    Registrar examen finalizado
                  </Button>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
