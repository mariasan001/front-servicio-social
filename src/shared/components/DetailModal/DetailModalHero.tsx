import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "@/shared/styles/DetailModal.module.css";

type DetailModalHeroProps = {
  icon?: LucideIcon;
  badge?: string;
  iconTone?: "default" | "warning";
  title: string;
  subtitle?: ReactNode;
  badges?: ReactNode;
};

export function DetailModalHero({
  icon: Icon,
  badge,
  iconTone = "default",
  title,
  subtitle,
  badges,
}: DetailModalHeroProps) {
  const iconClassName = [
    Icon ? styles.modalHeroIcon : styles.modalHeroBadge,
    iconTone === "warning" ? styles.modalHeroIconWarning : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={styles.modalHero}>
      {Icon ? (
        <div className={iconClassName} aria-hidden="true">
          <Icon size={28} strokeWidth={1.75} />
        </div>
      ) : badge ? (
        <span className={iconClassName}>{badge}</span>
      ) : null}
      <div className={styles.modalHeroCopy}>
        <h3 className={styles.modalHeroTitle}>{title}</h3>
        {subtitle ? <p className={styles.modalHeroSubtitle}>{subtitle}</p> : null}
        {badges ? <div className={styles.heroBadges}>{badges}</div> : null}
      </div>
    </header>
  );
}
