"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  generateEscuelaTokenAction,
  getEscuelaDetailAction,
  reactivateEscuelaTokenAction,
  revokeEscuelaTokenAction,
  suspendEscuelaTokenAction,
  type EscuelaDetailPayload,
} from "../../actions/escuelas.actions";
import type { TokenGeneradoResponse } from "../../types/escuela.types";
import { EscuelaFormModal } from "./EscuelaFormModal";
import {
  escuelaEstatusTone,
  formatEtiqueta,
  formatFecha,
} from "./escuela-labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, TextInput } from "@/shared/components/Form";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

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
  const router = useRouter();
  const [detail, setDetail] = useState<EscuelaDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (!open || escuelaId === null) {
      return;
    }

    const selectedEscuelaId = escuelaId;
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      setInvitacionError(null);
      setInvitacionGenerada(null);

      const result = await getEscuelaDetailAction(selectedEscuelaId);

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
  }, [escuelaId, open, reloadKey]);

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

  return (
    <>
      <Modal
        open={open}
        title={escuela?.nombreOficial ?? escuelaName ?? "Información de la escuela"}
        onClose={onClose}
        size="lg"
        footer={
          escuela ? (
            <div className={styles.modalFooter}>
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
          <LoadingState label="Cargando información de la escuela…" />
        ) : null}

        {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}

        {!isLoading && escuela ? (
          <div className={styles.detailLayout}>
            <div className={styles.detailSummary}>
              <div className={styles.panelBadges}>
                <StatusBadge tone={escuelaEstatusTone(escuela.estatus)}>
                  {formatEtiqueta(escuela.estatus, "Sin estatus")}
                </StatusBadge>
                <StatusBadge tone={escuelaEstatusTone(escuela.convenioEstatus)}>
                  Convenio: {formatEtiqueta(escuela.convenioEstatus, "Sin convenio")}
                </StatusBadge>
              </div>
              {escuela.nombreCorto ? (
                <p className={styles.detailLead}>Nombre corto: {escuela.nombreCorto}</p>
              ) : null}
            </div>

            <dl className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <dt>Municipio</dt>
                <dd>{escuela.municipio?.trim() || "Sin municipio registrado"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Correo de contacto</dt>
                <dd>{escuela.correoContacto?.trim() || "Sin correo registrado"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Teléfono</dt>
                <dd>{escuela.telefono?.trim() || "Sin teléfono registrado"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Clave de registro</dt>
                <dd>{escuela.clave?.trim() || "Sin clave registrada"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Domicilio</dt>
                <dd>{escuela.domicilio?.trim() || "Sin domicilio registrado"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Última actualización</dt>
                <dd>{formatFecha(escuela.fechaActualizacion ?? escuela.fechaCreacion)}</dd>
              </div>
            </dl>

            <section
              className={styles.detailSection}
              aria-labelledby="escuela-invitaciones-title"
            >
              <div className={styles.detailSectionHeader}>
                <h3 id="escuela-invitaciones-title" className={styles.detailSectionTitle}>
                  Invitaciones de registro
                </h3>
                <p className={styles.detailSectionDescription}>
                  Genera enlaces para que los alumnos se registren vinculados a esta institución.
                </p>
              </div>

              {invitacionError ? <Alert tone="error">{invitacionError}</Alert> : null}

              {invitacionGenerada ? (
                <div className={styles.successBox}>
                  <strong>Invitación generada correctamente</strong>
                  {invitacionGenerada.urlRegistro ? (
                    <span>
                      Enlace de registro: <strong>{invitacionGenerada.urlRegistro}</strong>
                    </span>
                  ) : null}
                  {invitacionGenerada.token ? (
                    <span>
                      Código de invitación: <strong>{invitacionGenerada.token}</strong>
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className={styles.inlineForm}>
                <TextInput
                  id="invitacion-nombre"
                  label="Nombre de la invitación"
                  hint="Opcional. Te ayuda a identificarla después."
                  value={invitacionNombre}
                  onChange={(event) => setInvitacionNombre(event.target.value)}
                />

                <TextInput
                  id="invitacion-expiracion"
                  label="Fecha de vencimiento"
                  type="date"
                  hint="Opcional. Si no indicas fecha, se usará la vigencia predeterminada."
                  value={invitacionExpiracion}
                  onChange={(event) => setInvitacionExpiracion(event.target.value)}
                />

                <CheckboxField
                  id="invitacion-revocar"
                  label="Cancelar invitaciones activas antes de generar una nueva"
                  checked={revocarActivas}
                  onChange={setRevocarActivas}
                />

                <div className={styles.formActions}>
                  <Button
                    type="button"
                    onClick={() => void handleGenerateInvitacion()}
                    disabled={isMutating}
                  >
                    Generar invitación
                  </Button>
                </div>
              </div>

              {invitaciones.length === 0 ? (
                <p className={styles.emptyInline}>
                  Esta escuela aún no tiene invitaciones de registro registradas.
                </p>
              ) : (
                <ul className={styles.panelList}>
                  {invitaciones.map((invitacion) => {
                    const estatus = normalizeEstatus(invitacion.estatus);

                    return (
                      <li key={invitacion.idToken} className={styles.panelCard}>
                        <div className={styles.panelHeader}>
                          <strong>
                            {invitacion.nombre?.trim() || "Invitación sin nombre"}
                          </strong>
                          <StatusBadge tone={escuelaEstatusTone(invitacion.estatus)}>
                            {formatEtiqueta(invitacion.estatus, "Sin estatus")}
                          </StatusBadge>
                        </div>
                        <p className={styles.panelMeta}>
                          Vence el {formatFecha(invitacion.fechaExpiracion)}
                        </p>
                        <div className={styles.detailActions}>
                          {estatus === "ACTIVO" || estatus === "VIGENTE" ? (
                            <Button
                              type="button"
                              variant="outline"
                              className={styles.actionButton}
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
                              className={styles.actionButton}
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
                              variant="secondary"
                              className={styles.actionButton}
                              disabled={isMutating}
                              onClick={() => void handleTokenAction("revoke", invitacion.idToken)}
                            >
                              Cancelar invitación
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
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
