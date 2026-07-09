"use client";

import { Link2 } from "lucide-react";
import type { EscuelaTokenResponse, TokenGeneradoResponse } from "../../types/escuela.types";
import { InvitacionGeneradaCard } from "./InvitacionGeneradaCard";
import { resolveInvitationShareData } from "./invitation-share";
import { formatFecha } from "./escuela-labels";
import escuelaStyles from "./EscuelaDetailModal.module.css";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CheckboxField, TextInput } from "@/shared/components/Form";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";

function normalizeEstatus(value?: string) {
  return value?.trim().toUpperCase() ?? "";
}

function formatInviteExpiry(fechaExpiracion?: string) {
  if (!fechaExpiracion?.trim()) {
    return null;
  }

  return formatFecha(fechaExpiracion);
}

type EscuelaInvitacionesPanelProps = {
  invitaciones: EscuelaTokenResponse[];
  invitacionError: string | null;
  invitacionGenerada: TokenGeneradoResponse | null;
  invitacionNombre: string;
  invitacionExpiracion: string;
  revocarActivas: boolean;
  isMutating: boolean;
  expandedInviteId: number | null;
  generatedTokens: Record<number, string>;
  revealingId: number | null;
  onInvitacionNombreChange: (value: string) => void;
  onInvitacionExpiracionChange: (value: string) => void;
  onRevocarActivasChange: (value: boolean) => void;
  onGenerate: () => void;
  onToggleEnlace: (idToken: number) => void;
  onTokenAction: (action: "suspend" | "revoke" | "reactivate", idToken: number) => void;
};

export function EscuelaInvitacionesPanel({
  invitaciones,
  invitacionError,
  invitacionGenerada,
  invitacionNombre,
  invitacionExpiracion,
  revocarActivas,
  isMutating,
  expandedInviteId,
  generatedTokens,
  revealingId,
  onInvitacionNombreChange,
  onInvitacionExpiracionChange,
  onRevocarActivasChange,
  onGenerate,
  onToggleEnlace,
  onTokenAction,
}: EscuelaInvitacionesPanelProps) {
  return (
    <section className={detailStyles.contentPanel} aria-labelledby="escuela-invitaciones-title">
      <div className={detailStyles.panelHeader}>
        <h3 id="escuela-invitaciones-title" className={detailStyles.panelTitle}>
          Invitaciones de registro
        </h3>
      </div>

      {invitacionError ? <Alert tone="error">{invitacionError}</Alert> : null}

      {invitacionGenerada ? <InvitacionGeneradaCard invitacion={invitacionGenerada} /> : null}

      <div className={escuelaStyles.composer}>
        <p className={escuelaStyles.composerTitle}>Generar nueva invitación</p>

        <div className={escuelaStyles.composerFields}>
          <TextInput
            id="invitacion-nombre"
            label="Nombre"
            hint="Opcional"
            value={invitacionNombre}
            onChange={(event) => onInvitacionNombreChange(event.target.value)}
          />

          <TextInput
            id="invitacion-expiracion"
            label="Vence el"
            type="date"
            hint="Opcional"
            value={invitacionExpiracion}
            onChange={(event) => onInvitacionExpiracionChange(event.target.value)}
          />
        </div>

        <div className={escuelaStyles.composerFooter}>
          <CheckboxField
            id="invitacion-revocar"
            label="Revocar invitaciones activas al generar"
            checked={revocarActivas}
            onChange={onRevocarActivasChange}
          />

          <div className={escuelaStyles.composerActions}>
            <Button
              type="button"
              variant="primary"
              onClick={onGenerate}
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
              const shareData = resolveInvitationShareData(
                invitacion,
                generatedTokens[invitacion.idToken],
              );
              const canShareLink = Boolean(shareData) || Boolean(invitacion.recuperable);
              const isExpanded = expandedInviteId === invitacion.idToken;
              const isRevealing = revealingId === invitacion.idToken;
              const isVigente =
                estatus === "ACTIVO" || estatus === "VIGENTE" || estatus === "DISPONIBLE";
              const showNoRecuperableHint = !canShareLink && isVigente;

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
                      <p className={escuelaStyles.inviteMeta}>
                        {formatInviteExpiry(invitacion.fechaExpiracion)
                          ? `Vence el ${formatInviteExpiry(invitacion.fechaExpiracion)}`
                          : "Sin fecha de vencimiento"}
                        {invitacion.fechaCreacion ? (
                          <>
                            {" · "}
                            Creada el {formatFecha(invitacion.fechaCreacion)}
                          </>
                        ) : null}
                      </p>
                      {showNoRecuperableHint ? (
                        <p className={escuelaStyles.inviteHint}>
                          El enlace de esta invitación no se puede recuperar. Genera una invitación
                          nueva para obtener un enlace para compartir.
                        </p>
                      ) : null}
                    </div>

                    <div className={escuelaStyles.inviteActions}>
                      {canShareLink ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isMutating || isRevealing}
                          onClick={() => onToggleEnlace(invitacion.idToken)}
                        >
                          {isRevealing
                            ? "Recuperando…"
                            : isExpanded
                              ? "Ocultar enlace"
                              : "Ver enlace"}
                        </Button>
                      ) : null}
                      {isVigente ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isMutating}
                          onClick={() => onTokenAction("suspend", invitacion.idToken)}
                        >
                          Suspender
                        </Button>
                      ) : null}
                      {estatus === "SUSPENDIDO" ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isMutating}
                          onClick={() => onTokenAction("reactivate", invitacion.idToken)}
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
                          onClick={() => onTokenAction("revoke", invitacion.idToken)}
                        >
                          Cancelar
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded && shareData ? (
                    <div className={escuelaStyles.inviteExpanded}>
                      <InvitacionGeneradaCard invitacion={shareData} variant="stored" />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
