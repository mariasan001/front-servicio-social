"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  generateEscuelaTokenAction,
  getEscuelaDetailAction,
  reactivateEscuelaTokenAction,
  revealEscuelaTokenAction,
  revokeEscuelaTokenAction,
  suspendEscuelaTokenAction,
} from "../../actions/escuelas.actions";
import type { TokenGeneradoResponse } from "../../types/escuela.types";
import { EscuelaDetailInfo } from "./EscuelaDetailInfo";
import { EscuelaFormModal } from "./EscuelaFormModal";
import { EscuelaInvitacionesPanel } from "./EscuelaInvitacionesPanel";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import { compactPayload } from "@/lib/actions/normalize-server-args";
import detailStyles from "@/shared/styles/DetailModal.module.css";

type EscuelaDetailModalProps = {
  escuelaId: number | null;
  escuelaName?: string;
  open: boolean;
  onClose: () => void;
};

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
  const [generatedTokens, setGeneratedTokens] = useState<Record<number, string>>({});
  const [revealingId, setRevealingId] = useState<number | null>(null);
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    escuelaId,
    getEscuelaDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setInvitacionError(null);
        setInvitacionGenerada(null);
        setExpandedInviteId(null);
        setGeneratedTokens({});
        setRevealingId(null);
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

    const result = await generateEscuelaTokenAction(
      detail.escuela.idEscuela,
      compactPayload({
        nombre: invitacionNombre.trim() || undefined,
        fechaExpiracion: invitacionExpiracion || undefined,
        revocarTokensActivos: revocarActivas,
      }),
    );

    setIsMutating(false);

    if (!result.success) {
      setInvitacionError(result.error);
      return;
    }

    setInvitacionGenerada(result.data);

    if (result.data.token?.trim()) {
      setGeneratedTokens((current) => ({
        ...current,
        [result.data.idToken]: result.data.token!.trim(),
      }));
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

  const handleToggleEnlace = async (idToken: number) => {
    if (!detail) {
      return;
    }

    if (expandedInviteId === idToken) {
      setExpandedInviteId(null);
      return;
    }

    if (generatedTokens[idToken]) {
      setExpandedInviteId(idToken);
      return;
    }

    setRevealingId(idToken);
    setInvitacionError(null);

    const result = await revealEscuelaTokenAction(detail.escuela.idEscuela, idToken);

    setRevealingId(null);

    if (!result.success) {
      setInvitacionError(result.error);
      return;
    }

    const token = result.data.token?.trim();

    if (!token) {
      setInvitacionError(
        "El enlace ya no está disponible. Genera una nueva invitación para compartirla.",
      );
      return;
    }

    setGeneratedTokens((current) => ({ ...current, [idToken]: token }));
    setExpandedInviteId(idToken);
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
        {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}

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

            <EscuelaDetailInfo escuela={escuela} />

            <EscuelaInvitacionesPanel
              invitaciones={invitaciones}
              invitacionError={invitacionError}
              invitacionGenerada={invitacionGenerada}
              invitacionNombre={invitacionNombre}
              invitacionExpiracion={invitacionExpiracion}
              revocarActivas={revocarActivas}
              isMutating={isMutating}
              expandedInviteId={expandedInviteId}
              generatedTokens={generatedTokens}
              revealingId={revealingId}
              onInvitacionNombreChange={setInvitacionNombre}
              onInvitacionExpiracionChange={setInvitacionExpiracion}
              onRevocarActivasChange={setRevocarActivas}
              onGenerate={() => void handleGenerateInvitacion()}
              onToggleEnlace={(idToken) => void handleToggleEnlace(idToken)}
              onTokenAction={(action, idToken) => void handleTokenAction(action, idToken)}
            />
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
