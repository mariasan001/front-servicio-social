"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  cancelProcesoHoraAction,
  observeProcesoHoraAction,
  rejectProcesoHoraAction,
  validateProcesoHoraAction,
} from "../../actions/procesos.actions";
import type { HoraPendienteResponse } from "../../types/delegacion.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/PanelDetailView.module.css";

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
  const horaRef = useRef(hora);
  horaRef.current = hora;
  const [comentario, setComentario] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const { detail, error, setError } = useDetailModalLoader(
    open,
    hora?.idAsistencia ?? null,
    async (id) => {
      const current = horaRef.current;
      if (!current || current.idAsistencia !== id) {
        return { success: false as const, error: "No se encontró el registro de horas." };
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

  const run = async (action: "validate" | "observe" | "reject" | "cancel") => {
    if (!detail) return;
    setIsMutating(true);
    setError(null);
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(detail.idProceso, detail.idAsistencia, comentario.trim() ? { comentarioDelegacion: comentario.trim() } : {})
        : action === "observe"
          ? await observeProcesoHoraAction(detail.idProceso, detail.idAsistencia, { comentarioDelegacion: comentario.trim() || "Observación registrada." })
          : action === "reject"
            ? await rejectProcesoHoraAction(detail.idProceso, detail.idAsistencia, { comentarioDelegacion: comentario.trim() || "Registro rechazado." })
            : await cancelProcesoHoraAction(detail.idProceso, detail.idAsistencia, { motivoCancelacion: comentario.trim() || "Cancelado por delegación." });
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
      {detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>{formatEtiqueta(detail.estatus)}</StatusBadge>
          <p className={styles.detailLead}>{detail.alumnoNombre ?? "Alumno"}</p>
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
