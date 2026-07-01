"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  activateDependenciaAction,
  deactivateDependenciaAction,
  getDependenciaDetailAction,
} from "../../actions/dependencias.actions";
import type { DependenciaResponse } from "../../types/dependencia.types";
import { DependenciaFormModal } from "./DependenciaFormModal";
import { areaStatusLabel, areaStatusTone, formatFecha } from "../areas/area-labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "../areas/AdminAreasView.module.css";

type DependenciaDetailModalProps = {
  dependenciaId: number | null;
  dependenciaName?: string;
  open: boolean;
  onClose: () => void;
};

export function DependenciaDetailModal({
  dependenciaId,
  dependenciaName,
  open,
  onClose,
}: DependenciaDetailModalProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<DependenciaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!open || dependenciaId === null) {
      return;
    }

    const selectedDependenciaId = dependenciaId;
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      setDetail(null);

      const result = await getDependenciaDetailAction(selectedDependenciaId);

      if (cancelled) {
        return;
      }

      if (result.success) {
        setDetail(result.data);
      } else {
        setError(result.error);
      }

      setIsLoading(false);
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [dependenciaId, open, reloadKey]);

  const handleToggleStatus = async () => {
    if (!detail) {
      return;
    }

    setIsMutating(true);
    setError(null);

    const result =
      detail.activa === false
        ? await activateDependenciaAction(detail.idDependencia)
        : await deactivateDependenciaAction(detail.idDependencia);

    setIsMutating(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setDetail(result.data);
    router.refresh();
    setReloadKey((current) => current + 1);
  };

  const handleMutationSuccess = () => {
    router.refresh();
    setReloadKey((current) => current + 1);
  };

  return (
    <>
      <Modal
        open={open}
        title={detail?.nombre ?? dependenciaName ?? "Información de la dependencia"}
        onClose={onClose}
        size="lg"
        footer={
          detail ? (
            <div className={styles.modalFooter}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(true)}
                disabled={isMutating}
              >
                Editar
              </Button>
              <Button
                type="button"
                variant={detail.activa === false ? "primary" : "secondary"}
                onClick={() => void handleToggleStatus()}
                disabled={isMutating}
              >
                {isMutating
                  ? "Procesando…"
                  : detail.activa === false
                    ? "Activar dependencia"
                    : "Desactivar dependencia"}
              </Button>
            </div>
          ) : undefined
        }
      >
        {isLoading ? (
          <LoadingState label="Cargando información de la dependencia…" />
        ) : null}

        {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}

        {!isLoading && detail ? (
          <div className={styles.detailLayout}>
            <div className={styles.detailSummary}>
              <StatusBadge tone={areaStatusTone(detail.activa)}>
                {areaStatusLabel(detail.activa)}
              </StatusBadge>
              <p className={styles.detailLead}>
                {detail.descripcion?.trim() ||
                  "Esta dependencia aún no tiene una descripción registrada."}
              </p>
            </div>

            <dl className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <dt>Siglas</dt>
                <dd>{detail.siglas?.trim() || "Sin siglas registradas"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Clave de registro</dt>
                <dd>{detail.clave?.trim() || "Sin clave registrada"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Fecha de registro</dt>
                <dd>{formatFecha(detail.fechaCreacion)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Última actualización</dt>
                <dd>{formatFecha(detail.fechaActualizacion ?? detail.fechaCreacion)}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Modal>

      <DependenciaFormModal
        open={editOpen}
        mode="edit"
        dependencia={detail}
        onClose={() => setEditOpen(false)}
        onSuccess={handleMutationSuccess}
      />
    </>
  );
}
