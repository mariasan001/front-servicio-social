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
} from "@/lib/domain";
import { formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import formLayoutStyles from "@/shared/styles/PanelFormModal.module.css";

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
            detailStyles.layout,
            detailStyles.modalBody,
            isReloading && detailStyles.layoutBusy,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >

          <DetailModalHero
            icon={UserRound}
            title={alumnoNombre || "Sin nombre registrado"}
            subtitle={folio || `Postulación #${detail.idPostulacion}`}
            badges={<EstatusBadge estatus={detail.estatus} />}
          />

          <dl className={detailStyles.metaList}>
            <div className={detailStyles.metaRow}>
              <dt>Alumno</dt>
              <dd>{alumnoNombre || "Sin nombre"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Vacante</dt>
              <dd>{vacanteNombre || vacanteFolio || "Sin vacante"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Fecha de postulación</dt>
              <dd>{formatFecha(detail.fechaPostulacion)}</dd>
            </div>
            <div className={detailStyles.metaRow}>
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
            <div className={detailStyles.narrativeSection}>
              <p className={detailStyles.narrativeLabel}>Resultado del examen</p>
              <p className={detailStyles.narrativeValue}>{detail.resultadoExamen}</p>
            </div>
          ) : null}

          {detail.comentarioAlumno ? (
            <div className={detailStyles.narrativeSection}>
              <p className={detailStyles.narrativeLabel}>Comentario del alumno</p>
              <p className={detailStyles.narrativeValue}>{detail.comentarioAlumno}</p>
            </div>
          ) : null}

          {detail.comentarioTitular ? (
            <div className={detailStyles.narrativeSection}>
              <p className={detailStyles.narrativeLabel}>Tu comentario previo</p>
              <p className={detailStyles.narrativeValue}>{detail.comentarioTitular}</p>
            </div>
          ) : null}

          {detail.motivoRechazo ? (
            <div className={detailStyles.narrativeSection}>
              <p className={detailStyles.narrativeLabel}>Motivo de rechazo</p>
              <p className={detailStyles.narrativeValue}>{detail.motivoRechazo}</p>
            </div>
          ) : null}

          {canAccept ? (
            <section className={detailStyles.contentPanel} aria-label="Aceptar postulación">
              <div className={detailStyles.panelHeader}>
                <h3 className={detailStyles.panelTitle}>Aceptar postulación</h3>
                <p className={detailStyles.panelDescription}>
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
                      const payload =
                        comentario.trim() ? { comentario: comentario.trim() } : {};
                      const result = await acceptPostulacionAction(detail.idPostulacion, payload);
                      setIsMutating(false);
                      if (!result.success) {
                        notify.error(result.error);
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
            <section className={detailStyles.contentPanel} aria-label="Rechazar postulación">
              <div className={detailStyles.panelHeader}>
                <h3 className={detailStyles.panelTitle}>Rechazar postulación</h3>
                <p className={detailStyles.panelDescription}>
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
                    className={detailStyles.dangerButton}
                    disabled={isMutating}
                    onClick={async () => {
                      if (!motivoRechazo.trim()) {
                        notify.error("Escribe el motivo de rechazo.");
                        return;
                      }
                      setIsMutating(true);
                      const result = await rejectPostulacionAction(detail.idPostulacion, {
                        motivo: motivoRechazo.trim(),
                      });
                      setIsMutating(false);
                      if (!result.success) {
                        notify.error(result.error);
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
            <section className={detailStyles.contentPanel} aria-label="Registrar examen">
              <div className={detailStyles.panelHeader}>
                <h3 className={detailStyles.panelTitle}>Registrar examen</h3>
                <p className={detailStyles.panelDescription}>
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
                        notify.error("Indica el resultado del examen como número.");
                        return;
                      }
                      setIsMutating(true);
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
                        notify.error(result.error);
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
