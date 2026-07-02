"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  acceptPostulacionAction,
  getPostulacionDetailAction,
  markPostulacionExamFinishedAction,
  rejectPostulacionAction,
} from "../../actions/postulaciones.actions";
import type { PostulacionDetalleResponse } from "../../types/titular.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function TitularPostulacionDetailModal({
  postulacionId,
  open,
  onClose,
}: {
  postulacionId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<PostulacionDetalleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [comentario, setComentario] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [resultadoExamen, setResultadoExamen] = useState("");

  useEffect(() => {
    if (!open || postulacionId === null) return;
    const id = postulacionId;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      setActionError(null);
      const result = await getPostulacionDetailAction(id);
      if (cancelled) return;
      if (result.success) setDetail(result.data);
      else setError(result.error);
      setIsLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [open, postulacionId, reloadKey]);

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const estatus = detail?.estatus?.trim().toUpperCase() ?? "";
  const canAccept = estatus === "PENDIENTE" || estatus === "EN_REVISION";
  const canReject = canAccept || estatus === "ACEPTADA";
  const canMarkExam = estatus === "ACEPTADA" || estatus === "EN_EXAMEN";

  return (
    <Modal
      open={open}
      title={detail?.folio ? `Postulación ${detail.folio}` : "Postulación"}
      onClose={onClose}
      size="lg"
    >
      {isLoading ? <LoadingState label="Cargando postulación…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      {!isLoading && detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>
            {formatEtiqueta(detail.estatus)}
          </StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>Alumno</dt>
              <dd>{detail.alumnoNombre ?? "Sin nombre"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Vacante</dt>
              <dd>{detail.vacanteFolio ?? "Sin folio"}</dd>
            </div>
          </dl>
          {detail.comentarioAlumno ? (
            <p className={styles.detailLead}>{detail.comentarioAlumno}</p>
          ) : null}

          {canAccept ? (
            <div className={styles.inlineForm}>
              <TextInput
                id="comentario-aceptar"
                label="Comentario (opcional)"
                value={comentario}
                onChange={(event) => setComentario(event.target.value)}
              />
              <Button
                type="button"
                disabled={isMutating}
                onClick={async () => {
                  setIsMutating(true);
                  const result = await acceptPostulacionAction(detail.idPostulacion, {
                    comentarioTitular: comentario.trim() || undefined,
                  });
                  setIsMutating(false);
                  if (!result.success) setActionError(result.error);
                  else refresh();
                }}
              >
                Aceptar postulación
              </Button>
            </div>
          ) : null}

          {canReject ? (
            <div className={styles.inlineForm}>
              <FormField id="motivo-rechazo" label="Motivo de rechazo">
                <textarea
                  id="motivo-rechazo"
                  className={formStyles.textarea}
                  rows={2}
                  value={motivoRechazo}
                  onChange={(event) => setMotivoRechazo(event.target.value)}
                />
              </FormField>
              <Button
                type="button"
                variant="secondary"
                disabled={isMutating}
                onClick={async () => {
                  if (!motivoRechazo.trim()) {
                    setActionError("Escribe el motivo de rechazo.");
                    return;
                  }
                  setIsMutating(true);
                  const result = await rejectPostulacionAction(detail.idPostulacion, {
                    motivoRechazo: motivoRechazo.trim(),
                    comentarioTitular: comentario.trim() || undefined,
                  });
                  setIsMutating(false);
                  if (!result.success) setActionError(result.error);
                  else refresh();
                }}
              >
                Rechazar postulación
              </Button>
            </div>
          ) : null}

          {canMarkExam ? (
            <div className={styles.inlineForm}>
              <TextInput
                id="resultado-examen"
                label="Resultado del examen"
                value={resultadoExamen}
                onChange={(event) => setResultadoExamen(event.target.value)}
              />
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
                  const result = await markPostulacionExamFinishedAction(detail.idPostulacion, {
                    resultadoExamen: resultadoExamen.trim(),
                    comentarioTitular: comentario.trim() || undefined,
                  });
                  setIsMutating(false);
                  if (!result.success) setActionError(result.error);
                  else refresh();
                }}
              >
                Registrar examen finalizado
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
