"use client";

import { Shield } from "lucide-react";
import type { IncidenciaResponse } from "../../types/alumno.types";
import { formatEtiqueta } from "@/lib/domain";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";

type IncidenciaDetalleModalProps = {
  open: boolean;
  incidencia: IncidenciaResponse | null;
  incidenciaLabel: string;
  onClose: () => void;
};

export function IncidenciaDetalleModal({
  open,
  incidencia,
  incidenciaLabel,
  onClose,
}: IncidenciaDetalleModalProps) {
  if (!open || !incidencia) {
    return null;
  }

  const descripcion = incidencia.descripcion?.trim();

  return (
    <Modal
      open
      title={incidenciaLabel}
      onClose={onClose}
      size="md"
      footer={
        <div className={detailStyles.footerActions}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className={detailStyles.modalBody}>
        <DetailModalHero
          icon={Shield}
          iconTone="warning"
          title={incidenciaLabel}
          badges={<EstatusBadge estatus={incidencia.estatus} />}
        />

        <dl className={detailStyles.metaList}>
          <div className={detailStyles.metaRow}>
            <dt>Severidad</dt>
            <dd>{formatEtiqueta(incidencia.severidad, "Sin severidad")}</dd>
          </div>
          <div className={detailStyles.metaRow}>
            <dt>Tipo</dt>
            <dd>{formatEtiqueta(incidencia.tipo, "Incidencia")}</dd>
          </div>
        </dl>

        <div className={detailStyles.narrativeSection}>
          <p className={detailStyles.narrativeLabel}>Descripción</p>
          <p
            className={[
              detailStyles.narrativeValue,
              !descripcion && detailStyles.narrativeEmpty,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {descripcion || "Sin descripción registrada."}
          </p>
        </div>
      </div>
    </Modal>
  );
}
