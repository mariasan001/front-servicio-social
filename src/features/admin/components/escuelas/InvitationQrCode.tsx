"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/shared/components/Button";
import styles from "./InvitacionGeneradaCard.module.css";

type InvitationQrCodeProps = {
  value: string;
  fileName?: string;
};

export function InvitationQrCode({
  value,
  fileName = "invitacion-registro-qr.png",
}: InvitationQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void QRCode.toDataURL(value, {
      width: 220,
      margin: 2,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value]);

  const handleDownload = () => {
    if (!dataUrl) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = fileName;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  if (error) {
    return (
      <p className={styles.qrError} role="status">
        No se pudo generar el código QR. Usa el enlace de registro.
      </p>
    );
  }

  if (!dataUrl) {
    return <div className={styles.qrSkeleton} aria-hidden="true" />;
  }

  return (
    <div className={styles.qrBlock}>
      <div className={styles.qrFrame}>
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL from qrcode */}
        <img
          className={styles.qrImage}
          src={dataUrl}
          alt="Código QR del enlace de registro"
          width={180}
          height={180}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        className={styles.qrDownload}
        onClick={handleDownload}
      >
        <Download size={14} aria-hidden="true" />
        Descargar QR
      </Button>
    </div>
  );
}
