"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  formatSiNo,
  usuarioActivoLabel,
  usuarioActivoTone,
} from "./usuario-labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { PasswordInput } from "@/shared/components/Form";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

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
  const router = useRouter();
  const [detail, setDetail] = useState<UsuarioInternoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open || usuarioId === null) {
      return;
    }

    const selectedUsuarioId = usuarioId;
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      setPasswordError(null);
      setPasswordSuccess(null);
      setNewPassword("");

      const result = await getUsuarioDetailAction(selectedUsuarioId);

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
  }, [open, reloadKey, usuarioId]);

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

  return (
    <>
      <Modal
        open={open}
        title={detail?.nombreCompleto ?? usuarioName ?? "Información del usuario"}
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
                variant={detail.activo === false ? "primary" : "secondary"}
                onClick={() => void handleToggleStatus()}
                disabled={isMutating}
              >
                {isMutating
                  ? "Procesando…"
                  : detail.activo === false
                    ? "Activar cuenta"
                    : "Desactivar cuenta"}
              </Button>
            </div>
          ) : undefined
        }
      >
        {isLoading ? <LoadingState label="Cargando información del usuario…" /> : null}

        {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}

        {!isLoading && detail ? (
          <div className={styles.detailLayout}>
            <div className={styles.detailSummary}>
              <StatusBadge tone={usuarioActivoTone(detail.activo)}>
                {usuarioActivoLabel(detail.activo)}
              </StatusBadge>
              {detail.cargo ? (
                <p className={styles.detailLead}>Cargo: {detail.cargo}</p>
              ) : null}
            </div>

            <dl className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <dt>Correo electrónico</dt>
                <dd>{detail.correo}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Teléfono</dt>
                <dd>{detail.telefono?.trim() || "Sin teléfono registrado"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Nombre de usuario</dt>
                <dd>{detail.username}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Escuela vinculada</dt>
                <dd>{detail.escuelaNombre?.trim() || "No aplica"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Puede descargar cartas</dt>
                <dd>{formatSiNo(detail.puedeDescargarCartas)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Última actualización</dt>
                <dd>{formatFecha(detail.fechaActualizacion ?? detail.fechaCreacion)}</dd>
              </div>
            </dl>

            <section className={styles.detailSection} aria-labelledby="usuario-perfiles-title">
              <div className={styles.detailSectionHeader}>
                <h3 id="usuario-perfiles-title" className={styles.detailSectionTitle}>
                  Perfiles asignados
                </h3>
                <p className={styles.detailSectionDescription}>
                  Áreas del sistema a las que esta persona tiene acceso.
                </p>
              </div>

              {detail.roles.length === 0 ? (
                <p className={styles.emptyInline}>
                  Esta cuenta no tiene perfiles asignados por el momento.
                </p>
              ) : (
                <div className={styles.panelBadges}>
                  {detail.roles.map((rol) => (
                    <StatusBadge key={rol} tone="info">
                      {formatRol(rol)}
                    </StatusBadge>
                  ))}
                </div>
              )}
            </section>

            <section
              className={styles.detailSection}
              aria-labelledby="usuario-password-title"
            >
              <div className={styles.detailSectionHeader}>
                <h3 id="usuario-password-title" className={styles.detailSectionTitle}>
                  Restablecer contraseña
                </h3>
                <p className={styles.detailSectionDescription}>
                  Asigna una nueva contraseña temporal y compártela de forma segura.
                </p>
              </div>

              {passwordError ? <Alert tone="error">{passwordError}</Alert> : null}
              {passwordSuccess ? <Alert tone="success">{passwordSuccess}</Alert> : null}

              <div className={styles.inlineForm}>
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

                <div className={styles.formActions}>
                  <Button
                    type="button"
                    onClick={() => void handleResetPassword()}
                    disabled={isMutating}
                  >
                    Actualizar contraseña
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
