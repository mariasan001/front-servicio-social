"use client";

import { Check, CheckCircle2, Copy, ExternalLink, Link2 } from "lucide-react";
import { useState } from "react";
import type { TokenGeneradoResponse } from "../../types/escuela.types";
import { Button } from "@/shared/components/Button";
import { formatFecha } from "./escuela-labels";
import { InvitationQrCode } from "./InvitationQrCode";
import { buildRegistrationUrl } from "./invitation-link";
import styles from "./InvitacionGeneradaCard.module.css";

type InvitationShareData = Pick<TokenGeneradoResponse, "token" | "fechaExpiracion">;

type InvitacionGeneradaCardProps = {
  invitacion: InvitationShareData;
  variant?: "created" | "stored";
};

export function InvitacionGeneradaCard({
  invitacion,
  variant = "created",
}: InvitacionGeneradaCardProps) {
  const token = invitacion.token?.trim();
  const registrationUrl = buildRegistrationUrl(undefined, token);
  const isStored = variant === "stored";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!registrationUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(registrationUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!registrationUrl) {
    return null;
  }

  return (
    <article
      className={[styles.card, isStored && styles.cardStored].filter(Boolean).join(" ")}
      aria-live={isStored ? undefined : "polite"}
    >
      <div className={styles.header}>
        <span
          className={[styles.icon, isStored && styles.iconStored].filter(Boolean).join(" ")}
          aria-hidden="true"
        >
          {isStored ? (
            <Link2 size={16} strokeWidth={1.75} />
          ) : (
            <CheckCircle2 size={18} strokeWidth={1.75} />
          )}
        </span>
        <div className={styles.headerCopy}>
          <p className={styles.title}>
            {isStored ? "Compartir invitación" : "Invitación lista para compartir"}
          </p>
          <p className={styles.subtitle}>
            Escanea el QR o copia el enlace de registro para el alumno.
          </p>
        </div>
      </div>

      <div className={styles.shareLayout}>
        <div className={styles.qrColumn}>
          <InvitationQrCode value={registrationUrl} />
        </div>

        <div className={styles.linkColumn}>
          <span className={styles.fieldLabel}>Enlace de registro</span>
          <div className={styles.linkBox}>
            <p className={styles.linkValue} title={registrationUrl}>
              {registrationUrl}
            </p>
            <div className={styles.linkActions}>
              <Button
                type="button"
                variant="primary"
                className={styles.actionButton}
                onClick={() => void handleCopy()}
                aria-label="Copiar enlace de registro"
              >
                {copied ? (
                  <>
                    <Check size={14} aria-hidden="true" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy size={14} aria-hidden="true" />
                    Copiar enlace
                  </>
                )}
              </Button>
              <Button
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                className={styles.actionButton}
              >
                <ExternalLink size={14} aria-hidden="true" />
                Abrir
              </Button>
            </div>
          </div>

          {invitacion.fechaExpiracion ? (
            <p className={styles.expiry}>Vence el {formatFecha(invitacion.fechaExpiracion)}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
