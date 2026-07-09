"use client";

import { Building2 } from "lucide-react";
import styles from "./TitularVacanteFormModal.module.css";

type VacanteContextBannerProps = {
  areaLabel: string;
  hint?: string;
};

export function VacanteContextBanner({ areaLabel, hint }: VacanteContextBannerProps) {
  return (
    <div className={styles.contextBanner} role="status">
      <span className={styles.contextIconWrap} aria-hidden="true">
        <Building2 size={18} strokeWidth={1.75} />
      </span>
      <div className={styles.contextCopy}>
        <p className={styles.contextEyebrow}>Área asignada</p>
        <p className={styles.contextTitle}>{areaLabel}</p>
        {hint ? <p className={styles.contextHint}>{hint}</p> : null}
      </div>
    </div>
  );
}
