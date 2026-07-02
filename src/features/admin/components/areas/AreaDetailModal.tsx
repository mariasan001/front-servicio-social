"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  activateAreaAction,
  assignAreaTitularAction,
  deactivateAreaAction,
  deactivateAreaTitularAction,
  getAreaDetailAction,
  setPrincipalAreaTitularAction,
} from "../../actions/areas.actions";
import type { AreaDetalleResponse, AreaResponse } from "../../types/area.types";
import type { UsuarioInternoResponse } from "../../types/usuario.types";
import { AreaFormModal } from "./AreaFormModal";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, SelectInput } from "@/shared/components/Form";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import {
  areaStatusLabel,
  areaStatusTone,
  formatContacto,
  formatFecha,
  titularStatusLabel,
  titularStatusTone,
} from "./area-labels";
import styles from "@/shared/styles/PanelSectionView.module.css";

type AreaDetailModalProps = {
  areaId: number | null;
  areaName?: string;
  open: boolean;
  dependencias: { idDependencia: number; nombre: string }[];
  titularesDisponibles: UsuarioInternoResponse[];
  onClose: () => void;
};

export function AreaDetailModal({
  areaId,
  areaName,
  open,
  dependencias,
  titularesDisponibles,
  onClose,
}: AreaDetailModalProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<AreaDetalleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedTitularId, setSelectedTitularId] = useState("");
  const [esPrincipal, setEsPrincipal] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || areaId === null) {
      return;
    }

    const selectedAreaId = areaId;
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      setAssignError(null);

      const result = await getAreaDetailAction(selectedAreaId);

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
  }, [areaId, open, reloadKey]);

  const handleMutationSuccess = () => {
    router.refresh();
    setReloadKey((current) => current + 1);
  };

  const handleToggleStatus = async () => {
    if (!detail) {
      return;
    }

    setIsMutating(true);
    setError(null);

    const result =
      detail.activa === false
        ? await activateAreaAction(detail.idArea)
        : await deactivateAreaAction(detail.idArea);

    setIsMutating(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    handleMutationSuccess();
  };

  const handleAssignTitular = async () => {
    if (!detail || !selectedTitularId) {
      setAssignError("Selecciona a la persona titular que deseas asignar.");
      return;
    }

    setIsMutating(true);
    setAssignError(null);

    const result = await assignAreaTitularAction(detail.idArea, {
      usuarioId: Number(selectedTitularId),
      esPrincipal,
    });

    setIsMutating(false);

    if (!result.success) {
      setAssignError(result.error);
      return;
    }

    setSelectedTitularId("");
    setEsPrincipal(false);
    handleMutationSuccess();
  };

  const handleSetPrincipal = async (idAsignacion: number) => {
    if (!detail) {
      return;
    }

    setIsMutating(true);
    setAssignError(null);

    const result = await setPrincipalAreaTitularAction(detail.idArea, idAsignacion);
    setIsMutating(false);

    if (!result.success) {
      setAssignError(result.error);
      return;
    }

    handleMutationSuccess();
  };

  const handleDeactivateTitular = async (idAsignacion: number) => {
    if (!detail) {
      return;
    }

    setIsMutating(true);
    setAssignError(null);

    const result = await deactivateAreaTitularAction(detail.idArea, idAsignacion);
    setIsMutating(false);

    if (!result.success) {
      setAssignError(result.error);
      return;
    }

    handleMutationSuccess();
  };

  const titulares = detail?.titulares ?? [];
  const titularesActivos = titulares.filter((titular) => titular.vigente !== false);
  const areaForEdit: AreaResponse | null = detail;

  return (
    <>
      <Modal
        open={open}
        title={detail?.nombre ?? areaName ?? "Información del área"}
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
                    ? "Activar área"
                    : "Desactivar área"}
              </Button>
            </div>
          ) : undefined
        }
      >
        {isLoading ? <LoadingState label="Cargando información del área…" /> : null}

        {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}

        {!isLoading && detail ? (
          <div className={styles.detailLayout}>
            <div className={styles.detailSummary}>
              <StatusBadge tone={areaStatusTone(detail.activa)}>
                {areaStatusLabel(detail.activa)}
              </StatusBadge>
              <p className={styles.detailLead}>
                {detail.descripcion?.trim() ||
                  "Esta área aún no tiene una descripción registrada."}
              </p>
            </div>

            <dl className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <dt>Dependencia</dt>
                <dd>{detail.dependenciaNombre ?? "Sin dependencia asignada"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Ubicación</dt>
                <dd>{detail.ubicacion?.trim() || "Sin ubicación registrada"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Contacto</dt>
                <dd>{formatContacto(detail.correoContacto, detail.telefonoContacto)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Última actualización</dt>
                <dd>{formatFecha(detail.fechaActualizacion ?? detail.fechaCreacion)}</dd>
              </div>
            </dl>

            <section className={styles.detailSection} aria-labelledby="area-titulares-title">
              <div className={styles.detailSectionHeader}>
                <h3 id="area-titulares-title" className={styles.detailSectionTitle}>
                  Personas titulares
                </h3>
                <p className={styles.detailSectionDescription}>
                  Responsables asignados a esta área dentro de la dependencia.
                </p>
              </div>

              {assignError ? <Alert tone="error">{assignError}</Alert> : null}

              <div className={styles.inlineForm}>
                <SelectInput
                  id="area-titular-select"
                  label="Asignar titular"
                  placeholder="Selecciona una persona"
                  value={selectedTitularId}
                  onChange={(event) => setSelectedTitularId(event.target.value)}
                >
                  {titularesDisponibles.map((usuario) => (
                    <option key={usuario.idUsuario} value={usuario.idUsuario}>
                      {usuario.nombreCompleto}
                    </option>
                  ))}
                </SelectInput>

                <CheckboxField
                  id="area-titular-principal"
                  label="Marcar como responsable principal"
                  checked={esPrincipal}
                  onChange={setEsPrincipal}
                />

                <div className={styles.formActions}>
                  <Button
                    type="button"
                    onClick={() => void handleAssignTitular()}
                    disabled={isMutating || titularesDisponibles.length === 0}
                  >
                    Asignar titular
                  </Button>
                </div>
              </div>

              {titularesActivos.length === 0 ? (
                <p className={styles.emptyInline}>
                  Por el momento no hay titulares activos asignados a esta área.
                </p>
              ) : (
                <ul className={styles.panelList}>
                  {titularesActivos.map((titular) => (
                    <li key={titular.idAsignacion} className={styles.panelCard}>
                      <div className={styles.panelHeader}>
                        <strong>{titular.nombreCompleto ?? "Sin nombre registrado"}</strong>
                        <div className={styles.panelBadges}>
                          {titular.esPrincipal ? (
                            <StatusBadge tone="info">Responsable principal</StatusBadge>
                          ) : null}
                          <StatusBadge tone={titularStatusTone(titular.vigente)}>
                            {titularStatusLabel(titular.vigente)}
                          </StatusBadge>
                        </div>
                      </div>
                      <p className={styles.panelMeta}>
                        {titular.correo ?? "Sin correo registrado"}
                      </p>
                      <div className={styles.detailActions}>
                        {!titular.esPrincipal ? (
                          <Button
                            type="button"
                            variant="outline"
                            className={styles.actionButton}
                            disabled={isMutating}
                            onClick={() => void handleSetPrincipal(titular.idAsignacion)}
                          >
                            Marcar como principal
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="secondary"
                          className={styles.actionButton}
                          disabled={isMutating}
                          onClick={() => void handleDeactivateTitular(titular.idAsignacion)}
                        >
                          Quitar asignación
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </Modal>

      <AreaFormModal
        open={editOpen}
        mode="edit"
        area={areaForEdit}
        dependencias={dependencias}
        onClose={() => setEditOpen(false)}
        onSuccess={handleMutationSuccess}
      />
    </>
  );
}
