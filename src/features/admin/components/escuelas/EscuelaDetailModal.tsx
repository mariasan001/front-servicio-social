"use client";

import { GraduationCap, Link2 } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  generateEscuelaTokenAction,
  getEscuelaDetailAction,
  reactivateEscuelaTokenAction,
  revokeEscuelaTokenAction,
  suspendEscuelaTokenAction,
} from "../../actions/escuelas.actions";
import type { TokenGeneradoResponse } from "../../types/escuela.types";
import { EscuelaFormModal } from "./EscuelaFormModal";
import {
  escuelaEstatusTone,
  formatEtiqueta,
  formatFecha,
} from "./escuela-labels";
import escuelaStyles from "./EscuelaDetailModal.module.css";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, TextInput } from "@/shared/components/Form";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";

type EscuelaDetailModalProps = {
  escuelaId: number | null;
  escuelaName?: string;
  open: boolean;
  onClose: () => void;
};

function normalizeEstatus(value?: string) {
  return value?.trim().toUpperCase() ?? "";
}

export function EscuelaDetailModal({
  escuelaId,
  escuelaName,
  open,
  onClose,
}: EscuelaDetailModalProps) {
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [invitacionNombre, setInvitacionNombre] = useState("");
  const [invitacionExpiracion, setInvitacionExpiracion] = useState("");
  const [revocarActivas, setRevocarActivas] = useState(false);
  const [invitacionError, setInvitacionError] = useState<string | null>(null);
  const [invitacionGenerada, setInvitacionGenerada] = useState<TokenGeneradoResponse | null>(
    null,
  );
  const { detail, error, setError, isLoading } = useDetailModalLoader(
    open,
    escuelaId,
    getEscuelaDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setInvitacionError(null);
        setInvitacionGenerada(null);
      },
    },
  );

  const handleMutationSuccess = () => {
    router.refresh();
    setReloadKey((current) => current + 1);
  };

  const handleGenerateInvitacion = async () => {
    if (!detail) {
      return;
    }

    setIsMutating(true);
    setInvitacionError(null);
    setInvitacionGenerada(null);

    const result = await generateEscuelaTokenAction(detail.escuela.idEscuela, {
      nombre: invitacionNombre.trim() || undefined,
      fechaExpiracion: invitacionExpiracion || undefined,
      revocarTokensActivos: revocarActivas,
    });

    setIsMutating(false);

    if (!result.success) {
      setInvitacionError(result.error);
      return;
    }

    setInvitacionGenerada(result.data);
    setInvitacionNombre("");
    setInvitacionExpiracion("");
    setRevocarActivas(false);
    handleMutationSuccess();
  };

  const handleTokenAction = async (
    action: "suspend" | "revoke" | "reactivate",
    idToken: number,
  ) => {
    if (!detail) {
      return;
    }

    setIsMutating(true);
    setInvitacionError(null);

    const idEscuela = detail.escuela.idEscuela;
    const result =
      action === "suspend"
        ? await suspendEscuelaTokenAction(idEscuela, idToken)
        : action === "revoke"
          ? await revokeEscuelaTokenAction(idEscuela, idToken)
          : await reactivateEscuelaTokenAction(idEscuela, idToken);

    setIsMutating(false);

    if (!result.success) {
      setInvitacionError(result.error);
      return;
    }

    handleMutationSuccess();
  };

  const escuela = detail?.escuela;
  const invitaciones = detail?.invitaciones ?? [];
  const nombreCorto = escuela?.nombreCorto?.trim();
  const clave = escuela?.clave?.trim();

  return (
    <>
      <Modal
        open={open}
        title={escuela?.nombreOficial ?? escuelaName ?? "Información de la escuela"}
        onClose={onClose}
        size="lg"
        footer={
          escuela ? (
            <div className={styles.footer}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(true)}
                disabled={isMutating}
              >
                Editar
              </Button>
            </div>
          ) : undefined
        }
      >
        {isLoading ? (
          <EntityDetailModalSkeleton sections={2} />
        ) : null}

        {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}

        {!isLoading && escuela ? (
          <div className={styles.layout}>
            <div className={styles.summaryBar}>
              <div className={styles.avatar} aria-hidden="true">
                <GraduationCap size={18} strokeWidth={1.75} />
              </div>

              <div className={styles.summaryMeta}>
                <p className={styles.summaryPrimary}>
                  {nombreCorto || clave || "Institución educativa"}
                </p>
                <p className={styles.summarySecondary}>
                  {clave ? `Clave ${clave}` : escuela.municipio?.trim() || "Sin municipio registrado"}
                </p>
              </div>

              <div className={styles.summaryBadges}>
                <StatusBadge tone={escuelaEstatusTone(escuela.estatus)}>
                  {formatEtiqueta(escuela.estatus, "Sin estatus")}
                </StatusBadge>
                <StatusBadge tone={escuelaEstatusTone(escuela.convenioEstatus)}>
                  {formatEtiqueta(escuela.convenioEstatus, "Sin convenio")}
                </StatusBadge>
              </div>
            </div>

            <div className={styles.infoPanel}>
              <dl className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <dt>Municipio</dt>
                  <dd>{escuela.municipio?.trim() || "Sin municipio registrado"}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Correo de contacto</dt>
                  <dd>{escuela.correoContacto?.trim() || "Sin correo registrado"}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Teléfono</dt>
                  <dd>{escuela.telefono?.trim() || "Sin teléfono registrado"}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Clave de registro</dt>
                  <dd>{clave || "Sin clave registrada"}</dd>
                </div>
                <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
                  <dt>Domicilio</dt>
                  <dd>{escuela.domicilio?.trim() || "Sin domicilio registrado"}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Última actualización</dt>
                  <dd>{formatFecha(escuela.fechaActualizacion ?? escuela.fechaCreacion)}</dd>
                </div>
              </dl>
            </div>

            <section
              className={`${styles.section} ${escuelaStyles.inviteSection}`}
              aria-labelledby="escuela-invitaciones-title"
            >
              <div className={styles.sectionHeader}>
                <h3 id="escuela-invitaciones-title" className={styles.sectionTitle}>
                  Invitaciones de registro
                </h3>
                <p className={styles.sectionDescription}>
                  Enlaces para que los alumnos se registren vinculados a esta institución.
                </p>
              </div>

              {invitacionError ? <Alert tone="error">{invitacionError}</Alert> : null}

              {invitacionGenerada ? (
                <div className={styles.successBox}>
                  <strong>Invitación generada correctamente</strong>
                  {invitacionGenerada.urlRegistro ? (
                    <span className={styles.successValue}>
                      Enlace: {invitacionGenerada.urlRegistro}
                    </span>
                  ) : null}
                  {invitacionGenerada.token ? (
                    <span className={styles.successValue}>
                      Código: {invitacionGenerada.token}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className={escuelaStyles.composer}>
                <p className={escuelaStyles.composerTitle}>Generar nueva invitación</p>

                <div className={escuelaStyles.composerFields}>
                  <TextInput
                    id="invitacion-nombre"
                    label="Nombre"
                    hint="Opcional"
                    value={invitacionNombre}
                    onChange={(event) => setInvitacionNombre(event.target.value)}
                  />

                  <TextInput
                    id="invitacion-expiracion"
                    label="Vence el"
                    type="date"
                    hint="Opcional"
                    value={invitacionExpiracion}
                    onChange={(event) => setInvitacionExpiracion(event.target.value)}
                  />
                </div>

                <div className={escuelaStyles.composerFooter}>
                  <CheckboxField
                    id="invitacion-revocar"
                    label="Revocar invitaciones activas al generar"
                    checked={revocarActivas}
                    onChange={setRevocarActivas}
                  />

                  <Button
                    type="button"
                    onClick={() => void handleGenerateInvitacion()}
                    disabled={isMutating}
                  >
                    Generar invitación
                  </Button>
                </div>
              </div>

              <div className={escuelaStyles.history}>
                <div className={escuelaStyles.historyHeader}>
                  <p className={escuelaStyles.historyTitle}>Invitaciones registradas</p>
                  <span className={escuelaStyles.historyCount}>{invitaciones.length}</span>
                </div>

                {invitaciones.length === 0 ? (
                  <p className={escuelaStyles.emptyInvites}>
                    <span className={escuelaStyles.emptyIcon} aria-hidden="true">
                      <Link2 size={14} strokeWidth={1.75} />
                    </span>
                    Aún no hay invitaciones para esta escuela.
                  </p>
                ) : (
                  <ul className={escuelaStyles.inviteList}>
                    {invitaciones.map((invitacion) => {
                      const estatus = normalizeEstatus(invitacion.estatus);

                      return (
                        <li key={invitacion.idToken} className={escuelaStyles.inviteRow}>
                          <div className={escuelaStyles.inviteMain}>
                            <div className={escuelaStyles.inviteTop}>
                              <span className={escuelaStyles.inviteName}>
                                {invitacion.nombre?.trim() || "Sin nombre"}
                              </span>
                              <StatusBadge tone={escuelaEstatusTone(invitacion.estatus)}>
                                {formatEtiqueta(invitacion.estatus, "Sin estatus")}
                              </StatusBadge>
                            </div>
                            <p className={escuelaStyles.inviteMeta}>
                              Vence el {formatFecha(invitacion.fechaExpiracion)}
                            </p>
                          </div>

                          <div className={escuelaStyles.inviteActions}>
                            {estatus === "ACTIVO" || estatus === "VIGENTE" ? (
                              <Button
                                type="button"
                                variant="outline"
                                disabled={isMutating}
                                onClick={() => void handleTokenAction("suspend", invitacion.idToken)}
                              >
                                Suspender
                              </Button>
                            ) : null}
                            {estatus === "SUSPENDIDO" ? (
                              <Button
                                type="button"
                                variant="outline"
                                disabled={isMutating}
                                onClick={() =>
                                  void handleTokenAction("reactivate", invitacion.idToken)
                                }
                              >
                                Reactivar
                              </Button>
                            ) : null}
                            {estatus !== "REVOCADO" ? (
                              <Button
                                type="button"
                                variant="outline"
                                className={styles.dangerButton}
                                disabled={isMutating}
                                onClick={() => void handleTokenAction("revoke", invitacion.idToken)}
                              >
                                Cancelar
                              </Button>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </Modal>

      <EscuelaFormModal
        open={editOpen}
        mode="edit"
        escuela={escuela}
        onClose={() => setEditOpen(false)}
        onSuccess={handleMutationSuccess}
      />
    </>
  );
}
