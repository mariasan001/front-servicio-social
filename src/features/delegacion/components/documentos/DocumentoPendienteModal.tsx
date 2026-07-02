"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useRef, useState } from "react";
import {
  approveProcesoDocumentoAction,
  observeProcesoDocumentoAction,
  rejectProcesoDocumentoAction,
} from "../../actions/procesos.actions";
import type { DocumentoPendienteResponse } from "../../types/delegacion.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/PanelDetailView.module.css";

export function DocumentoPendienteModal({
  documento,
  open,
  onClose,
}: {
  documento: DocumentoPendienteResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = usePanelRouter();
  const documentoRef = useRef(documento);
  documentoRef.current = documento;
  const [comentario, setComentario] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const { detail, error, setError } = useDetailModalLoader(
    open,
    documento?.idProcesoDocumento ?? null,
    async (id) => {
      const current = documentoRef.current;
      if (!current || current.idProcesoDocumento !== id) {
        return { success: false as const, error: "No se encontró el documento." };
      }
      return { success: true as const, data: current };
    },
    {
      onBeforeLoad: () => {
        setComentario("");
        setError(null);
      },
    },
  );

  const run = async (action: "approve" | "observe" | "reject") => {
    if (!detail) return;
    setIsMutating(true);
    setError(null);
    const body = comentario.trim() ? { observacion: comentario.trim() } : {};
    const result =
      action === "approve"
        ? await approveProcesoDocumentoAction(detail.idProceso, detail.idProcesoDocumento)
        : action === "observe"
          ? await observeProcesoDocumentoAction(detail.idProceso, detail.idProcesoDocumento, body)
          : await rejectProcesoDocumentoAction(detail.idProceso, detail.idProcesoDocumento, body);
    setIsMutating(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  };

  return (
    <Modal open={open} title="Revisar documento" onClose={onClose} size="lg">
      {detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>{formatEtiqueta(detail.estatus)}</StatusBadge>
          <p className={styles.detailLead}>
            <strong>{detail.alumnoNombre ?? "Alumno"}</strong> · {detail.tipoDocumento ?? "Documento"}
          </p>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <FormField id="doc-comentario" label="Comentario u observación">
            <textarea id="doc-comentario" className={formStyles.textarea} rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} />
          </FormField>
          <div className={styles.modalFooter}>
            <Button type="button" disabled={isMutating} onClick={() => void run("approve")}>Aprobar</Button>
            <Button type="button" variant="outline" disabled={isMutating} onClick={() => void run("observe")}>Observar</Button>
            <Button type="button" variant="secondary" disabled={isMutating} onClick={() => void run("reject")}>Rechazar</Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
