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
import { formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import sharedStyles from "@/shared/styles/EntityDetailModal.module.css";
import formLayoutStyles from "@/shared/styles/PanelFormModal.module.css";
import heroStyles from "../vacantes/TitularVacanteDetailModal.module.css";

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

          <div className={heroStyles.modalHero}>
            <span className={heroStyles.modalHeroIcon} aria-hidden="true">
              <UserRound size={22} strokeWidth={1.75} />
            </span>
            <div className={heroStyles.modalHeroCopy}>
              <p className={heroStyles.modalHeroTitle}>
                {alumnoNombre || "Sin nombre registrado"}
              </p>
              <p className={heroStyles.modalHeroSubtitle}>
                {folio || `Postulación #${detail.idPostulacion}`}
              </p>
              <EstatusBadge estatus={detail.estatus} />
            </div>
          </div>

          <dl className={heroStyles.metaList}>
            <div className={heroStyles.metaRow}>
              <dt>Alumno</dt>
              <dd>{alumnoNombre || "Sin nombre"}</dd>
            </div>
            <div className={heroStyles.metaRow}>
              <dt>Vacante</dt>
              <dd>{vacanteNombre || vacanteFolio || "Sin vacante"}</dd>
            </div>
            <div className={heroStyles.metaRow}>
              <dt>Fecha de postulación</dt>
              <dd>{formatFecha(detail.fechaPostulacion)}</dd>
            </div>
            <div className={heroStyles.metaRow}>
              <dt>Examen</dt>
              <dd>
                {detail.requiereExamen ? (
                  <EstatusBadge estatus={detail.examenEstado} fallback="Pendiente" />
                ) : (
                  "No aplica"
                )}
              </dd>
            </div>
          </dl>

          {detail.resultadoExamen ? (
            <div className={heroStyles.narrativeSection}>
              <p className={heroStyles.narrativeLabel}>Resultado del examen</p>
              <p className={heroStyles.narrativeValue}>{detail.resultadoExamen}</p>
            </div>
          ) : null}

          {detail.comentarioAlumno ? (
            <div className={heroStyles.narrativeSection}>
              <p className={heroStyles.narrativeLabel}>Comentario del alumno</p>
              <p className={heroStyles.narrativeValue}>{detail.comentarioAlumno}</p>
            </div>
          ) : null}

          {detail.comentarioTitular ? (
            <div className={heroStyles.narrativeSection}>
              <p className={heroStyles.narrativeLabel}>Tu comentario previo</p>
              <p className={heroStyles.narrativeValue}>{detail.comentarioTitular}</p>
            </div>
          ) : null}

          {detail.motivoRechazo ? (
            <div className={heroStyles.narrativeSection}>
              <p className={heroStyles.narrativeLabel}>Motivo de rechazo</p>
              <p className={heroStyles.narrativeValue}>{detail.motivoRechazo}</p>
            </div>
          ) : null}

          {canAccept ? (
            <section className={sharedStyles.section} aria-label="Aceptar postulación">
              <div className={sharedStyles.sectionHeader}>
                <h3 className={sharedStyles.sectionTitle}>Aceptar postulación</h3>
                <p className={sharedStyles.sectionDescription}>
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
                    variant="primary"
                    disabled={isMutating}
                    onClick={async () => {
                      setIsMutating(true);
                      setActionError(null);
                      const payload =
                        comentario.trim() ? { comentario: comentario.trim() } : {};
                      const result = await acceptPostulacionAction(detail.idPostulacion, payload);
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
            <section className={sharedStyles.section} aria-label="Rechazar postulación">
              <div className={sharedStyles.sectionHeader}>
                <h3 className={sharedStyles.sectionTitle}>Rechazar postulación</h3>
                <p className={sharedStyles.sectionDescription}>
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
                    className={sharedStyles.dangerButton}
                    disabled={isMutating}
                    onClick={async () => {
                      if (!motivoRechazo.trim()) {
                        setActionError("Escribe el motivo de rechazo.");
                        return;
                      }
                      setIsMutating(true);
                      setActionError(null);
                      const result = await rejectPostulacionAction(detail.idPostulacion, {
                        motivo: motivoRechazo.trim(),
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
            <section className={sharedStyles.section} aria-label="Registrar examen">
              <div className={sharedStyles.sectionHeader}>
                <h3 className={sharedStyles.sectionTitle}>Registrar examen</h3>
                <p className={sharedStyles.sectionDescription}>
                  Captura el resultado del examen de ingreso del alumno.
                </p>
              </div>
              <div className={formLayoutStyles.formLayout}>
                <TextInput
                  id="resultado-examen"
                  label="Resultado del examen"
                  type="number"
                  min={0}
                  max={100}
                  value={resultadoExamen}
                  onChange={(event) => setResultadoExamen(event.target.value)}
                />
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isMutating}
                    onClick={async () => {
                      const resultado = Number(resultadoExamen.trim());
                      if (!resultadoExamen.trim() || Number.isNaN(resultado)) {
                        setActionError("Indica el resultado del examen como número.");
                        return;
                      }
                      setIsMutating(true);
                      setActionError(null);
                      const examPayload: { resultadoExamen: number; comentario?: string } = {
                        resultadoExamen: resultado,
                      };
                      if (comentario.trim()) {
                        examPayload.comentario = comentario.trim();
                      }
                      const result = await markPostulacionExamFinishedAction(
                        detail.idPostulacion,
                        examPayload,
                      );
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
