"use client";

import { User } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  activateUsuarioInternoAction,
  deactivateUsuarioInternoAction,
  getUsuarioDetailAction,
  resetUsuarioInternoPasswordAction,
} from "../../actions/usuarios.actions";
import type { UsuarioInternoResponse } from "../../types/usuario.types";
import { UsuarioFormModal } from "./UsuarioFormModal";
import {
  formatFecha,
  formatRol,
  formatRoles,
  formatSiNo,
  formatUsername,
  usuarioActivoEstatus,
} from "./usuario-labels";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import usuarioStyles from "./UsuarioDetailModal.module.css";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { PasswordInput } from "@/shared/components/Form";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";

type UsuarioDetailModalProps = {
  usuarioId: number | null;
  usuarioName?: string;
  open: boolean;
  escuelas: { idEscuela: number; nombreOficial: string }[];
  onClose: () => void;
};

export function UsuarioDetailModal({
  usuarioId,
  usuarioName,
  open,
  escuelas,
  onClose,
}: UsuarioDetailModalProps) {
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const { detail, error, setError, isLoading, isReloading } = useDetailModalLoader(
    open,
    usuarioId,
    getUsuarioDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setPasswordError(null);
        setPasswordSuccess(null);
        setNewPassword("");
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
      detail.activo === false
        ? await activateUsuarioInternoAction(detail.idUsuario)
        : await deactivateUsuarioInternoAction(detail.idUsuario);

    setIsMutating(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    handleMutationSuccess();
  };

  const handleResetPassword = async () => {
    if (!detail) {
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError("Escribe la nueva contraseña.");
      return;
    }

    setIsMutating(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    const result = await resetUsuarioInternoPasswordAction(detail.idUsuario, {
      password: newPassword,
    });

    setIsMutating(false);

    if (!result.success) {
      setPasswordError(result.error);
      return;
    }

    setNewPassword("");
    setPasswordSuccess("La contraseña se actualizó correctamente.");
    handleMutationSuccess();
  };

  const isActive = detail?.activo !== false;
  const cargo = detail?.cargo?.trim();
  const username = detail ? formatUsername(detail.username) : "";

  return (
    <>
      <Modal
        open={open}
        title={detail?.nombreCompleto ?? usuarioName ?? "Información del usuario"}
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
                className={isActive ? styles.dangerButton : undefined}
                onClick={() => void handleToggleStatus()}
                disabled={isMutating}
              >
                {isMutating
                  ? "Procesando…"
                  : isActive
                    ? "Desactivar cuenta"
                    : "Activar cuenta"}
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
              detailStyles.modalBody,
              isReloading && styles.layoutBusy,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-busy={isReloading}
          >
            {error ? <Alert tone="error">{error}</Alert> : null}

            <div className={detailStyles.modalHero}>
              <span className={detailStyles.modalHeroIcon} aria-hidden="true">
                <User size={22} strokeWidth={1.75} />
              </span>
              <div className={detailStyles.modalHeroCopy}>
                <p className={detailStyles.modalHeroTitle}>
                  {cargo || formatRoles(detail.roles)}
                </p>
                <p className={detailStyles.modalHeroSubtitle}>{username}</p>
                <EstatusBadge estatus={usuarioActivoEstatus(detail.activo)} />
              </div>
            </div>

            <dl className={detailStyles.metaList}>
              <div className={detailStyles.metaRow}>
                <dt>Nombre</dt>
                <dd>{detail.nombreCompleto}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Usuario de acceso</dt>
                <dd>{username}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Correo electrónico</dt>
                <dd>{detail.correo}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Teléfono</dt>
                <dd>{detail.telefono?.trim() || "Sin teléfono registrado"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Escuela vinculada</dt>
                <dd>{detail.escuelaNombre?.trim() || "No aplica"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Puede descargar cartas</dt>
                <dd>{formatSiNo(detail.puedeDescargarCartas)}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Última actualización</dt>
                <dd>{formatFecha(detail.fechaActualizacion ?? detail.fechaCreacion)}</dd>
              </div>
            </dl>

            <section className={detailStyles.contentPanel} aria-labelledby="usuario-perfiles-title">
              <div className={detailStyles.panelHeader}>
                <h3 id="usuario-perfiles-title" className={detailStyles.panelTitle}>
                  Perfiles asignados
                </h3>
                <p className={detailStyles.panelDescription}>
                  Roles y permisos asignados a esta cuenta.
                </p>
              </div>

              {detail.roles.length === 0 ? (
                <p className={usuarioStyles.emptyRoles}>
                  Esta cuenta no tiene perfiles asignados por el momento.
                </p>
              ) : (
                <div className={usuarioStyles.roleList}>
                  {detail.roles.map((rol) => (
                    <span key={rol} className={usuarioStyles.roleChip}>
                      {formatRol(rol)}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className={detailStyles.contentPanel} aria-labelledby="usuario-password-title">
              <div className={detailStyles.panelHeader}>
                <h3 id="usuario-password-title" className={detailStyles.panelTitle}>
                  Restablecer contraseña
                </h3>
                <p className={detailStyles.panelDescription}>
                  Asigna una contraseña temporal y compártela de forma segura.
                </p>
              </div>

              {passwordError ? <Alert tone="error">{passwordError}</Alert> : null}
              {passwordSuccess ? <Alert tone="success">{passwordSuccess}</Alert> : null}

              <div className={usuarioStyles.passwordPanel}>
                <PasswordInput
                  id="usuario-new-password"
                  name="newPassword"
                  label="Nueva contraseña"
                  value={newPassword}
                  autoComplete="new-password"
                  onChange={(value) => {
                    setNewPassword(value);
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }}
                />

                <div className={usuarioStyles.passwordActions}>
                  <Button
                    type="button"
                    variant="success"
                    onClick={() => void handleResetPassword()}
                    disabled={isMutating || !newPassword.trim()}
                  >
                    {isMutating ? "Actualizando…" : "Actualizar contraseña"}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </Modal>

      <UsuarioFormModal
        open={editOpen}
        mode="edit"
        usuario={detail}
        escuelas={escuelas}
        onClose={() => setEditOpen(false)}
        onSuccess={handleMutationSuccess}
      />
    </>
  );
}
