"use client";

import { Building2 } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  activateDependenciaAction,
  deactivateDependenciaAction,
  getDependenciaDetailAction,
} from "../../actions/dependencias.actions";
import { DependenciaFormModal } from "./DependenciaFormModal";
import { areaActivaEstatus, formatFecha } from "../areas/area-labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
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
  const { detail, setDetail, error, setError, isLoading, isReloading } = useDetailModalLoader(
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
            <div className={detailStyles.footerActions}>
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
                className={isActive ? detailStyles.dangerButton : undefined}
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
        {isLoading && !detail ? (
          <EntityDetailModalSkeleton sections={1} />
        ) : null}

        {error && !detail ? <Alert tone="error">{error}</Alert> : null}

        {detail ? (
          <div
            className={[
              detailStyles.layout,
              detailStyles.modalBody,
              isReloading && detailStyles.layoutBusy,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-busy={isReloading}
          >
            {error ? <Alert tone="error">{error}</Alert> : null}

            <DetailModalHero
              icon={Building2}
              title={siglas || clave || detail.nombre}
              subtitle={clave ? `Clave ${clave}` : detail.nombre}
              badges={<EstatusBadge estatus={areaActivaEstatus(detail.activa)} />}
            />

            <dl className={detailStyles.metaList}>
              <div className={detailStyles.metaRow}>
                <dt>Nombre oficial</dt>
                <dd>{detail.nombre}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Siglas</dt>
                <dd>{siglas || "Sin siglas registradas"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Clave</dt>
                <dd>{clave || "Sin clave registrada"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Fecha de registro</dt>
                <dd>{formatFecha(detail.fechaCreacion)}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Última actualización</dt>
                <dd>{formatFecha(detail.fechaActualizacion ?? detail.fechaCreacion)}</dd>
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
