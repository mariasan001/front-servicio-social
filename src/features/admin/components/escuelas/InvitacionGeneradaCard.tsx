"use client";

import { Check, CheckCircle2, Copy, Link2 } from "lucide-react";
import { useState } from "react";
import type { TokenGeneradoResponse } from "../../types/escuela.types";
import { Button } from "@/shared/components/Button";
import { formatFecha } from "./escuela-labels";
import { buildRegistrationUrl } from "./invitation-link";
import styles from "./InvitacionGeneradaCard.module.css";

type InvitationShareData = Pick<TokenGeneradoResponse, "token" | "fechaExpiracion">;

type CopyFieldProps = {
  label: string;
  hint?: string;
  value: string;
  copyLabel: string;
  monospace?: boolean;
};

function CopyField({ label, hint, value, copyLabel, monospace = false }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {hint ? <p className={styles.fieldHint}>{hint}</p> : null}
      <div className={styles.fieldRow}>
        <output
          className={[styles.fieldValue, monospace && styles.fieldValueMono]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </output>
        <Button
          type="button"
          variant="outline"
          className={styles.copyButton}
          onClick={() => void handleCopy()}
          aria-label={`${copyLabel}: ${label}`}
        >
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" />
              Copiado
            </>
          ) : (
            <>
              <Copy size={14} aria-hidden="true" />
              {copyLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

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
            {isStored ? "Enlace de esta invitación" : "Invitación generada correctamente"}
          </p>
          <p className={styles.subtitle}>
            {isStored
              ? "Enlace de registro para compartir con el alumno."
              : "Comparte el enlace o el código con el alumno vinculado a esta escuela."}
          </p>
        </div>
      </div>

      {registrationUrl ? (
        <div className={styles.fieldGroup}>
          <CopyField
            label="Enlace de registro"
            hint="Compártelo con el alumno por correo, mensaje o código QR."
            value={registrationUrl}
            copyLabel="Copiar enlace"
          />
          <Button
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className={styles.openLinkButton}
          >
            Abrir página de registro
          </Button>
        </div>
      ) : null}

      {token ? (
        <CopyField
          label="Código de invitación"
          hint="Mismo valor que usa el enlace. No funciona ingresándolo en otra pantalla."
          value={token}
          copyLabel="Copiar código"
          monospace
        />
      ) : null}

      {invitacion.fechaExpiracion ? (
        <p className={styles.expiry}>Vence el {formatFecha(invitacion.fechaExpiracion)}</p>
      ) : null}
    </article>
  );
}
