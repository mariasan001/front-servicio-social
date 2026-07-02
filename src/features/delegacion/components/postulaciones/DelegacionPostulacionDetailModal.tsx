"use client";

import { useEffect, useState } from "react";
import { getPostulacionDetailAction } from "../../actions/postulaciones.actions";
import type { PostulacionResponse } from "../../types/delegacion.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

type DelegacionPostulacionDetailModalProps = {
  postulacionId: number | null;
  open: boolean;
  onClose: () => void;
};

export function DelegacionPostulacionDetailModal({
  postulacionId,
  open,
  onClose,
}: DelegacionPostulacionDetailModalProps) {
  const [detail, setDetail] = useState<PostulacionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || postulacionId === null) return;
    const id = postulacionId;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      const result = await getPostulacionDetailAction(id);
      if (cancelled) return;
      if (result.success) setDetail(result.data);
      else setError(result.error);
      setIsLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [open, postulacionId]);

  return (
    <Modal open={open} title={detail?.folio ? `Postulación ${detail.folio}` : "Postulación"} onClose={onClose} size="lg">
      {isLoading ? <LoadingState label="Cargando postulación…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {!isLoading && detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>{formatEtiqueta(detail.estatus)}</StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}><dt>Folio</dt><dd>{detail.folio ?? "Sin folio"}</dd></div>
            <div className={styles.detailItem}><dt>Identificador</dt><dd>#{detail.idPostulacion}</dd></div>
          </dl>
          <p className={styles.detailLead}>Esta sección es de consulta. Las acciones sobre postulaciones las realiza el titular del área.</p>
        </div>
      ) : null}
    </Modal>
  );
}
