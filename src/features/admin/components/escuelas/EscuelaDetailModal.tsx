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
import { InvitacionGeneradaCard } from "./InvitacionGeneradaCard";
import { cacheSchoolInvitation, getSchoolInvitation } from "./invitation-cache";
import {
  formatEtiqueta,
  formatFecha,
} from "./escuela-labels";
import escuelaStyles from "./EscuelaDetailModal.module.css";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, TextInput } from "@/shared/components/Form";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";

type EscuelaDetailModalProps = {
  escuelaId: number | null;
  escuelaName?: string;
  open: boolean;
  onClose: () => void;
};

function normalizeEstatus(value?: string) {
  return value?.trim().toUpperCase() ?? "";
}

function isActiveInvitation(estatus: string) {
  return estatus === "ACTIVO" || estatus === "VIGENTE" || estatus === "DISPONIBLE";
}

function formatInviteExpiry(fechaExpiracion?: string) {
  if (!fechaExpiracion?.trim()) {
    return null;
  }

  return formatFecha(fechaExpiracion);
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
  const [expandedInviteId, setExpandedInviteId] = useState<number | null>(null);
  const { detail, error, setError, isLoading, isReloading } = useDetailModalLoader(
    open,
    escuelaId,
    getEscuelaDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setInvitacionError(null);
        setInvitacionGenerada(null);
        setExpandedInviteId(null);
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

    if (result.data.token?.trim()) {
      cacheSchoolInvitation(detail.escuela.idEscuela, {
        idToken: result.data.idToken,
        token: result.data.token.trim(),
        urlRegistro: result.data.urlRegistro,
        fechaExpiracion: result.data.fechaExpiracion,
      });
      setExpandedInviteId(result.data.idToken);
    }

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
            <div className={detailStyles.footerActions}>
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
        {isLoading && !detail ? (
          <EntityDetailModalSkeleton sections={2} />
        ) : null}

        {error && !detail ? <Alert tone="error">{error}</Alert> : null}

        {escuela ? (
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
              icon={GraduationCap}
              title={nombreCorto || escuela.nombreOficial}
              subtitle={
                clave ? `Clave ${clave}` : escuela.municipio?.trim() || "Sin municipio registrado"
              }
              badges={
                <>
                  <EstatusBadge estatus={escuela.estatus} fallback="Sin estatus" />
                  <EstatusBadge estatus={escuela.convenioEstatus} fallback="Sin convenio" />
                </>
              }
            />

            <dl className={detailStyles.metaList}>
              <div className={detailStyles.metaRow}>
                <dt>Institución</dt>
                <dd>{escuela.nombreOficial}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Municipio</dt>
                <dd>{escuela.municipio?.trim() || "Sin municipio registrado"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Correo de contacto</dt>
                <dd>{escuela.correoContacto?.trim() || "Sin correo registrado"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Teléfono</dt>
                <dd>{escuela.telefono?.trim() || "Sin teléfono registrado"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Clave de registro</dt>
                <dd>{clave || "Sin clave registrada"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Domicilio</dt>
                <dd>{escuela.domicilio?.trim() || "Sin domicilio registrado"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Última actualización</dt>
                <dd>{formatFecha(escuela.fechaActualizacion ?? escuela.fechaCreacion)}</dd>
              </div>
            </dl>

            <section
              className={detailStyles.contentPanel}
              aria-labelledby="escuela-invitaciones-title"
            >
              <div className={detailStyles.panelHeader}>
                <h3 id="escuela-invitaciones-title" className={detailStyles.panelTitle}>
                  Invitaciones de registro
                </h3>
                <p className={detailStyles.panelDescription}>
                  Enlaces para que los alumnos se registren vinculados a esta institución.
                </p>
              </div>

              {invitacionError ? <Alert tone="error">{invitacionError}</Alert> : null}

              {invitacionGenerada ? (
                <InvitacionGeneradaCard invitacion={invitacionGenerada} />
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

                  <div className={escuelaStyles.composerActions}>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => void handleGenerateInvitacion()}
                      disabled={isMutating}
                    >
                      Generar invitación
                    </Button>
                  </div>
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
                      const cachedInvitation =
                        escuela && getSchoolInvitation(escuela.idEscuela, invitacion.idToken);
                      const canShareLink = isActiveInvitation(estatus);
                      const isExpanded = expandedInviteId === invitacion.idToken;

                      return (
                        <li key={invitacion.idToken} className={escuelaStyles.inviteRowItem}>
                          <div className={escuelaStyles.inviteRow}>
                            <span className={escuelaStyles.inviteIcon} aria-hidden="true">
                              <Link2 size={14} strokeWidth={1.75} />
                            </span>

                            <div className={escuelaStyles.inviteMain}>
                              <div className={escuelaStyles.inviteTop}>
                                <span className={escuelaStyles.inviteName}>
                                  {invitacion.nombre?.trim() || "Sin nombre"}
                                </span>
                                <EstatusBadge estatus={invitacion.estatus} />
                              </div>
                              {formatInviteExpiry(invitacion.fechaExpiracion) ? (
                                <p className={escuelaStyles.inviteMeta}>
                                  Vence el {formatInviteExpiry(invitacion.fechaExpiracion)}
                                </p>
                              ) : (
                                <p className={escuelaStyles.inviteMetaMuted}>
                                  Sin fecha de vencimiento
                                </p>
                              )}
                            </div>

                            <div className={escuelaStyles.inviteActions}>
                              {canShareLink ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={isMutating}
                                  onClick={() =>
                                    setExpandedInviteId(isExpanded ? null : invitacion.idToken)
                                  }
                                >
                                  {isExpanded ? "Ocultar enlace" : "Ver enlace"}
                                </Button>
                              ) : null}
                              {estatus === "ACTIVO" ||
                              estatus === "VIGENTE" ||
                              estatus === "DISPONIBLE" ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={isMutating}
                                  onClick={() =>
                                    void handleTokenAction("suspend", invitacion.idToken)
                                  }
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
                                  className={detailStyles.dangerButton}
                                  disabled={isMutating}
                                  onClick={() =>
                                    void handleTokenAction("revoke", invitacion.idToken)
                                  }
                                >
                                  Cancelar
                                </Button>
                              ) : null}
                            </div>
                          </div>

                          {isExpanded ? (
                            <div className={escuelaStyles.inviteExpanded}>
                              {cachedInvitation ? (
                                <InvitacionGeneradaCard
                                  invitacion={cachedInvitation}
                                  variant="stored"
                                />
                              ) : (
                                <p className={escuelaStyles.inviteUnavailable}>
                                  Por seguridad, el enlace completo solo se muestra al generar la
                                  invitación en esta sesión del navegador. Si lo perdiste, crea una
                                  nueva invitación o contacta al administrador del sistema.
                                </p>
                              )}
                            </div>
                          ) : null}
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
