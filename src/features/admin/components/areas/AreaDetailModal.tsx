"use client";

import { LayoutGrid, Mail } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useMemo, useState } from "react";
import {
  activateAreaAction,
  assignAreaTitularAction,
  deactivateAreaAction,
  deactivateAreaTitularAction,
  getAreaDetailAction,
  setPrincipalAreaTitularAction,
} from "../../actions/areas.actions";
import type { AreaResponse } from "../../types/area.types";
import type { UsuarioInternoResponse } from "../../types/usuario.types";
import { AreaFormModal } from "./AreaFormModal";
import areaStyles from "./AreaDetailModal.module.css";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, SearchableSelect } from "@/shared/components/Form";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import heroStyles from "@/features/titular/components/vacantes/TitularVacanteDetailModal.module.css";
import adminStyles from "../shared/AdminDetailContent.module.css";
import { areaActivaEstatus, formatContacto, formatFecha } from "./area-labels";

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
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedTitularId, setSelectedTitularId] = useState("");
  const [esPrincipal, setEsPrincipal] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const { detail, error, setError, isLoading, isReloading } = useDetailModalLoader(
    open,
    areaId,
    getAreaDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setAssignError(null);
        setSelectedTitularId("");
        setEsPrincipal(false);
      },
    },
  );

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
  const titularOptions = useMemo(() => {
    const assignedIds = new Set(titularesActivos.map((titular) => titular.idUsuario));

    return titularesDisponibles
      .filter((usuario) => !assignedIds.has(usuario.idUsuario))
      .map((usuario) => ({
        value: String(usuario.idUsuario),
        label: usuario.nombreCompleto,
        searchText: [usuario.username, usuario.correo, usuario.cargo].filter(Boolean).join(" "),
        hint: usuario.correo,
      }))
      .sort((left, right) => left.label.localeCompare(right.label, "es"));
  }, [titularesActivos, titularesDisponibles]);
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
            <div className={adminStyles.footerActions}>
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
                    ? "Desactivar área"
                    : "Activar área"}
              </Button>
            </div>
          ) : undefined
        }
      >
        {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}

        {error && !detail ? <Alert tone="error">{error}</Alert> : null}

        {detail ? (
          <div
            className={[
              styles.layout,
              heroStyles.modalBody,
              isReloading && styles.layoutBusy,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-busy={isReloading}
          >
            {error ? <Alert tone="error">{error}</Alert> : null}

            <div className={heroStyles.modalHero}>
              <span className={heroStyles.modalHeroIcon} aria-hidden="true">
                <LayoutGrid size={22} strokeWidth={1.75} />
              </span>
              <div className={heroStyles.modalHeroCopy}>
                <p className={heroStyles.modalHeroTitle}>
                  {dependenciaNombre || detail.nombre}
                </p>
                <p className={heroStyles.modalHeroSubtitle}>
                  {ubicacion || "Sin ubicación registrada"}
                </p>
                <EstatusBadge estatus={areaActivaEstatus(detail.activa)} />
              </div>
            </div>

            <dl className={heroStyles.metaList}>
              <div className={heroStyles.metaRow}>
                <dt>Área</dt>
                <dd>{detail.nombre}</dd>
              </div>
              <div className={heroStyles.metaRow}>
                <dt>Dependencia</dt>
                <dd>{dependenciaNombre || "Sin dependencia asignada"}</dd>
              </div>
              <div className={heroStyles.metaRow}>
                <dt>Ubicación</dt>
                <dd>{ubicacion || "Sin ubicación registrada"}</dd>
              </div>
              <div className={heroStyles.metaRow}>
                <dt>Contacto</dt>
                <dd>{formatContacto(detail.correoContacto, detail.telefonoContacto)}</dd>
              </div>
              <div className={heroStyles.metaRow}>
                <dt>Última actualización</dt>
                <dd>{formatFecha(detail.fechaActualizacion ?? detail.fechaCreacion)}</dd>
              </div>
            </dl>

            <div className={heroStyles.narrativeSection}>
              <p className={heroStyles.narrativeLabel}>Descripción</p>
              <p
                className={[
                  heroStyles.narrativeValue,
                  !descripcion && heroStyles.narrativeEmpty,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {descripcion || "Esta área aún no tiene una descripción registrada."}
              </p>
            </div>

            <section
              className={adminStyles.contentPanel}
              aria-labelledby="area-titulares-title"
            >
              <div className={adminStyles.panelHeader}>
                <div className={adminStyles.panelTitleRow}>
                  <h3 id="area-titulares-title" className={adminStyles.panelTitle}>
                    Personas titulares
                  </h3>
                  <span className={adminStyles.countBadge}>{titularesActivos.length}</span>
                </div>
                <p className={adminStyles.panelDescription}>
                  Responsables asignados a esta área.
                </p>
              </div>

              {assignError ? <Alert tone="error">{assignError}</Alert> : null}

              <div className={areaStyles.assignForm}>
                <div className={areaStyles.assignRow}>
                  <SearchableSelect
                    id="area-titular-select"
                    label="Persona titular"
                    placeholder="Selecciona o busca persona"
                    value={selectedTitularId}
                    options={titularOptions}
                    emptyMessage="No hay personas titulares disponibles para asignar."
                    onChange={setSelectedTitularId}
                  />

                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => void handleAssignTitular()}
                    disabled={isMutating || titularOptions.length === 0}
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
              </div>

              {titularesActivos.length === 0 ? (
                <p className={areaStyles.emptyTitulares}>
                  No hay titulares activos en esta área.
                </p>
              ) : (
                <ul className={areaStyles.titularList}>
                  {titularesActivos.map((titular) => (
                    <li key={titular.idAsignacion} className={areaStyles.titularRow}>
                      <span className={areaStyles.titularAvatar} aria-hidden="true">
                        {(titular.nombreCompleto ?? "?")
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase() ?? "")
                          .join("")}
                      </span>

                      <div className={areaStyles.titularMain}>
                        <div className={areaStyles.titularTop}>
                          <span className={areaStyles.titularName}>
                            {titular.nombreCompleto ?? "Sin nombre registrado"}
                          </span>
                          {titular.esPrincipal ? (
                            <EstatusBadge estatus="PRINCIPAL" fallback="Principal" />
                          ) : null}
                          <EstatusBadge
                            estatus={titular.vigente === false ? "INACTIVO" : "ACTIVO"}
                          />
                        </div>
                        <p className={areaStyles.titularMeta}>
                          <Mail size={12} strokeWidth={1.75} aria-hidden="true" />
                          <span>{titular.correo ?? "Sin correo registrado"}</span>
                        </p>
                      </div>

                      <div className={areaStyles.titularActions}>
                        {!titular.esPrincipal ? (
                          <Button
                            type="button"
                            variant="primary"
                            disabled={isMutating}
                            onClick={() => void handleSetPrincipal(titular.idAsignacion)}
                          >
                            Hacer principal
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          className={styles.dangerButton}
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
