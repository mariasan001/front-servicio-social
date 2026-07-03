"use client";

import { Shield } from "lucide-react";
import type { IncidenciaResponse } from "../../types/alumno.types";
import { formatEtiqueta } from "@/lib/domain";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "./DocumentoGestionModal.module.css";
import detailStyles from "./IncidenciaDetalleModal.module.css";

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
        <div className={styles.footerActions}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className={styles.modalBody}>
        <div className={styles.modalHero}>
          <span className={detailStyles.modalHeroBadge} aria-hidden="true">
            <Shield size={22} strokeWidth={1.75} />
          </span>
          <div className={styles.modalHeroCopy}>
            <p className={styles.modalHeroTitle}>{incidenciaLabel}</p>
            <EstatusBadge estatus={incidencia.estatus} />
          </div>
        </div>

        <dl className={styles.metaList}>
          <div className={styles.metaRow}>
            <dt>Severidad</dt>
            <dd>{formatEtiqueta(incidencia.severidad, "Sin severidad")}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Tipo</dt>
            <dd>{formatEtiqueta(incidencia.tipo, "Incidencia")}</dd>
          </div>
        </dl>

        <div className={detailStyles.descriptionBlock}>
          <p className={detailStyles.descriptionLabel}>Descripción</p>
          {descripcion ? (
            <p className={detailStyles.descriptionValue}>{descripcion}</p>
          ) : (
            <p className={detailStyles.descriptionMuted}>Sin descripción registrada.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
