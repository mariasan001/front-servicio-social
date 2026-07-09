"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/monitoring/report-error";
import { StatusPage } from "@/shared/components/StatusPage/StatusPage";
import styles from "@/shared/components/StatusPage/StatusPage.module.css";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <StatusPage
      title="Ocurrió un error inesperado"
      message="No pudimos cargar esta sección. Puedes intentar de nuevo o volver al inicio."
      primaryAction={
        <button type="button" className={styles.primaryAction} onClick={() => reset()}>
          Reintentar
        </button>
      }
    />
  );
}
