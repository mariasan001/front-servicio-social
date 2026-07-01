"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  cancelProcesoHoraAction,
  observeProcesoHoraAction,
  rejectProcesoHoraAction,
  validateProcesoHoraAction,
} from "../../actions/procesos.actions";
import type { HoraPendienteResponse } from "../../types/delegacion.types";
import { estatusTone, formatEtiqueta } from "../shared/delegacion-labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/features/admin/components/areas/AdminAreasView.module.css";

export function HoraPendienteModal({
  hora,
  open,
  onClose,
}: {
  hora: HoraPendienteResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const run = async (action: "validate" | "observe" | "reject" | "cancel") => {
    if (!hora) return;
    setIsMutating(true);
    setError(null);
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(hora.idProceso, hora.idAsistencia, comentario.trim() ? { comentarioDelegacion: comentario.trim() } : {})
        : action === "observe"
          ? await observeProcesoHoraAction(hora.idProceso, hora.idAsistencia, { comentarioDelegacion: comentario.trim() || "Observación registrada." })
          : action === "reject"
            ? await rejectProcesoHoraAction(hora.idProceso, hora.idAsistencia, { comentarioDelegacion: comentario.trim() || "Registro rechazado." })
            : await cancelProcesoHoraAction(hora.idProceso, hora.idAsistencia, { motivoCancelacion: comentario.trim() || "Cancelado por delegación." });
    setIsMutating(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  };

  return (
    <Modal open={open} title="Revisar horas" onClose={onClose} size="lg">
      {hora ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(hora.estatus)}>{formatEtiqueta(hora.estatus)}</StatusBadge>
          <p className={styles.detailLead}>{hora.alumnoNombre ?? "Alumno"}</p>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <FormField id="hora-comentario" label="Comentario">
            <textarea id="hora-comentario" className={formStyles.textarea} rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} />
          </FormField>
          <div className={styles.modalFooter}>
            <Button type="button" disabled={isMutating} onClick={() => void run("validate")}>Validar</Button>
            <Button type="button" variant="outline" disabled={isMutating} onClick={() => void run("observe")}>Observar</Button>
            <Button type="button" variant="secondary" disabled={isMutating} onClick={() => void run("reject")}>Rechazar</Button>
            <Button type="button" variant="secondary" disabled={isMutating} onClick={() => void run("cancel")}>Cancelar</Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
