"use client";

import { Building2 } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  activateDependenciaAction,
  deactivateDependenciaAction,
  getDependenciaDetailAction,
} from "../../actions/dependencias.actions";
import type { DependenciaResponse } from "../../types/dependencia.types";
import { DependenciaFormModal } from "./DependenciaFormModal";
import dependenciaStyles from "./DependenciaDetailModal.module.css";
import { areaStatusLabel, areaStatusTone, formatFecha } from "../areas/area-labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";

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
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { detail, setDetail, error, setError, isLoading } = useDetailModalLoader(
    open,
    dependenciaId,
    getDependenciaDetailAction,
    { reloadKey },
  );

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

  const isActive = detail?.activa !== false;
  const siglas = detail?.siglas?.trim();
  const clave = detail?.clave?.trim();
  const descripcion = detail?.descripcion?.trim();

  return (
    <>
      <Modal
        open={open}
        title={detail?.nombre ?? dependenciaName ?? "Información de la dependencia"}
        onClose={onClose}
        size="lg"
        footer={
          detail ? (
            <div className={styles.footer}>
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
                variant={isActive ? "outline" : "primary"}
                className={isActive ? styles.dangerButton : undefined}
                onClick={() => void handleToggleStatus()}
                disabled={isMutating}
              >
                {isMutating
                  ? "Procesando…"
                  : isActive
                    ? "Desactivar dependencia"
                    : "Activar dependencia"}
              </Button>
            </div>
          ) : undefined
        }
      >
        {isLoading ? (
          <EntityDetailModalSkeleton sections={1} />
        ) : null}

        {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}

        {!isLoading && detail ? (
          <div className={styles.layout}>
            <div className={styles.summaryBar}>
              <div className={styles.avatar} aria-hidden="true">
                <Building2 size={18} strokeWidth={1.75} />
              </div>

              <div className={styles.summaryMeta}>
                <p className={styles.summaryPrimary}>
                  {siglas || clave || detail.nombre}
                </p>
                <p className={styles.summarySecondary}>
                  {clave && siglas
                    ? `Clave ${clave}`
                    : clave
                      ? "Dependencia receptora"
                      : siglas
                        ? "Dependencia receptora"
                        : "Sin clave registrada"}
                </p>
              </div>

              <StatusBadge tone={areaStatusTone(detail.activa)}>
                {areaStatusLabel(detail.activa)}
              </StatusBadge>
            </div>

            <div className={styles.infoPanel}>
              <dl className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <dt>Fecha de registro</dt>
                  <dd>{formatFecha(detail.fechaCreacion)}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Última actualización</dt>
                  <dd>{formatFecha(detail.fechaActualizacion ?? detail.fechaCreacion)}</dd>
                </div>
              </dl>

              <div className={dependenciaStyles.descriptionBlock}>
                <p className={dependenciaStyles.descriptionLabel}>Descripción</p>
                <p
                  className={
                    descripcion
                      ? dependenciaStyles.descriptionValue
                      : dependenciaStyles.descriptionEmpty
                  }
                >
                  {descripcion || "Sin descripción registrada."}
                </p>
              </div>
            </div>
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
