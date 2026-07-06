import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./StatCard.module.css";

export type StatCardTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: StatCardTone;
  hint?: string;
};

export function StatCard({ label, value, icon: Icon, tone = "neutral", hint }: StatCardProps) {
  return (
    <article className={styles.card} data-tone={tone}>
      <div className={styles.cardHead}>
        <p className={styles.label}>{label}</p>
        <div className={styles.iconWrap} aria-hidden="true">
          <Icon className={styles.icon} size={14} strokeWidth={1.5} />
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.value}>{value}</p>
        {hint ? <p className={styles.hint}>{hint}</p> : null}
      </div>
    </article>
  );
}

type StatCardsProps = {
  children: ReactNode;
  className?: string;
  columns?: 3 | 4;
  compact?: boolean;
  "aria-live"?: "off" | "polite" | "assertive";
};

export function StatCards({
  children,
  className,
  columns = 3,
  compact = false,
  "aria-live": ariaLive,
}: StatCardsProps) {
  return (
    <div
      className={[
        styles.grid,
        columns === 4 && styles.gridFour,
        compact && styles.gridCompact,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-live={ariaLive}
    >
      {children}
    </div>
  );
}
