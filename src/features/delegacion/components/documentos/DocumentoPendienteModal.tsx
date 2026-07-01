"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  approveProcesoDocumentoAction,
  observeProcesoDocumentoAction,
  rejectProcesoDocumentoAction,
} from "../../actions/procesos.actions";
import type { DocumentoPendienteResponse } from "../../types/delegacion.types";
import { estatusTone, formatEtiqueta } from "../shared/delegacion-labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/features/admin/components/areas/AdminAreasView.module.css";

export function DocumentoPendienteModal({
  documento,
  open,
  onClose,
}: {
  documento: DocumentoPendienteResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const run = async (action: "approve" | "observe" | "reject") => {
    if (!documento) return;
    setIsMutating(true);
    setError(null);
    const body = comentario.trim() ? { observacion: comentario.trim() } : {};
    const result =
      action === "approve"
        ? await approveProcesoDocumentoAction(documento.idProceso, documento.idProcesoDocumento)
        : action === "observe"
          ? await observeProcesoDocumentoAction(documento.idProceso, documento.idProcesoDocumento, body)
          : await rejectProcesoDocumentoAction(documento.idProceso, documento.idProcesoDocumento, body);
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
      {documento ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(documento.estatus)}>{formatEtiqueta(documento.estatus)}</StatusBadge>
          <p className={styles.detailLead}>
            <strong>{documento.alumnoNombre ?? "Alumno"}</strong> · {documento.tipoDocumento ?? "Documento"}
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
