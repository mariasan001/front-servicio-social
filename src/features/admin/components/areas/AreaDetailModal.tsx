"use client";

import { LayoutGrid } from "lucide-react";
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
import areaStyles from "./AreaDetailModal.module.css";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, SelectInput } from "@/shared/components/Form";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import {
  areaStatusLabel,
  areaStatusTone,
  formatContacto,
  formatFecha,
  titularStatusLabel,
  titularStatusTone,
} from "./area-labels";

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
      setSelectedTitularId("");
      setEsPrincipal(false);

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
  const isActive = detail?.activa !== false;
  const dependenciaNombre = detail?.dependenciaNombre?.trim();
  const ubicacion = detail?.ubicacion?.trim();
  const descripcion = detail?.descripcion?.trim();

  return (
    <>
      <Modal
        open={open}
        title={detail?.nombre ?? areaName ?? "Información del área"}
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
                className={isActive ? areaStyles.dangerOutline : undefined}
                onClick={() => void handleToggleStatus()}
                disabled={isMutating}
              >
                {isMutating
                  ? "Procesando…"
                  : isActive
                    ? "Desactivar área"
                    : "Activar área"}
              </Button>
            </div>
          ) : undefined
        }
      >
        {isLoading ? <LoadingState label="Cargando información del área…" /> : null}

        {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}

        {!isLoading && detail ? (
          <div className={styles.layout}>
            <div className={styles.summaryBar}>
              <div className={styles.avatar} aria-hidden="true">
                <LayoutGrid size={18} strokeWidth={1.75} />
              </div>

              <div className={styles.summaryMeta}>
                <p className={styles.summaryPrimary}>
                  {dependenciaNombre || "Sin dependencia asignada"}
                </p>
                <p className={styles.summarySecondary}>
                  {ubicacion || "Sin ubicación registrada"}
                </p>
              </div>

              <StatusBadge tone={areaStatusTone(detail.activa)}>
                {areaStatusLabel(detail.activa)}
              </StatusBadge>
            </div>

            <div className={styles.infoPanel}>
              <dl className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <dt>Dependencia</dt>
                  <dd>{dependenciaNombre || "Sin dependencia asignada"}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Ubicación</dt>
                  <dd>{ubicacion || "Sin ubicación registrada"}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Contacto</dt>
                  <dd>{formatContacto(detail.correoContacto, detail.telefonoContacto)}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Última actualización</dt>
                  <dd>{formatFecha(detail.fechaActualizacion ?? detail.fechaCreacion)}</dd>
                </div>
              </dl>
            </div>

            <section className={styles.section} aria-labelledby="area-descripcion-title">
              <div className={styles.sectionHeader}>
                <h3 id="area-descripcion-title" className={styles.sectionTitle}>
                  Descripción
                </h3>
                <p className={styles.sectionDescription}>
                  Funciones y alcance de esta área dentro de la dependencia.
                </p>
              </div>
              <p className={styles.sectionBody}>
                {descripcion || "Esta área aún no tiene una descripción registrada."}
              </p>
            </section>

            <section
              className={areaStyles.titularesBlock}
              aria-labelledby="area-titulares-title"
            >
              <div className={styles.sectionHeader}>
                <div className={areaStyles.titleRow}>
                  <h3 id="area-titulares-title" className={styles.sectionTitle}>
                    Personas titulares
                  </h3>
                  <span className={areaStyles.countBadge}>{titularesActivos.length}</span>
                </div>
                <p className={styles.sectionDescription}>
                  Responsables asignados a esta área.
                </p>
              </div>

              {assignError ? <Alert tone="error">{assignError}</Alert> : null}

              <div className={areaStyles.assignRow}>
                <SelectInput
                  id="area-titular-select"
                  label="Persona titular"
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

                <Button
                  type="button"
                  onClick={() => void handleAssignTitular()}
                  disabled={isMutating || titularesDisponibles.length === 0}
                >
                  Asignar
                </Button>
              </div>

              <CheckboxField
                id="area-titular-principal"
                label="Marcar como responsable principal"
                checked={esPrincipal}
                onChange={setEsPrincipal}
              />

              {titularesActivos.length === 0 ? (
                <p className={areaStyles.emptyTitulares}>
                  No hay titulares activos en esta área.
                </p>
              ) : (
                <ul className={areaStyles.titularList}>
                  {titularesActivos.map((titular) => (
                    <li key={titular.idAsignacion} className={areaStyles.titularRow}>
                      <div className={areaStyles.titularMain}>
                        <div className={areaStyles.titularTop}>
                          <span className={areaStyles.titularName}>
                            {titular.nombreCompleto ?? "Sin nombre registrado"}
                          </span>
                          {titular.esPrincipal ? (
                            <StatusBadge tone="info">Principal</StatusBadge>
                          ) : null}
                          <StatusBadge tone={titularStatusTone(titular.vigente)}>
                            {titularStatusLabel(titular.vigente)}
                          </StatusBadge>
                        </div>
                        <p className={areaStyles.titularMeta}>
                          {titular.correo ?? "Sin correo registrado"}
                        </p>
                      </div>

                      <div className={areaStyles.titularActions}>
                        {!titular.esPrincipal ? (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isMutating}
                            onClick={() => void handleSetPrincipal(titular.idAsignacion)}
                          >
                            Hacer principal
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          className={areaStyles.dangerOutline}
                          disabled={isMutating}
                          onClick={() => void handleDeactivateTitular(titular.idAsignacion)}
                        >
                          Quitar
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
