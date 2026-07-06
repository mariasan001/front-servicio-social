import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "@/shared/styles/DetailModal.module.css";

type DetailModalHeroProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  badges?: ReactNode;
};

export function DetailModalHero({ icon: Icon, title, subtitle, badges }: DetailModalHeroProps) {
  return (
    <header className={styles.modalHero}>
      <div className={styles.modalHeroIcon} aria-hidden="true">
        <Icon size={28} strokeWidth={1.75} />
      </div>
      <div className={styles.modalHeroCopy}>
        <h3 className={styles.modalHeroTitle}>{title}</h3>
        {subtitle ? <p className={styles.modalHeroSubtitle}>{subtitle}</p> : null}
        {badges ? <div className={styles.heroBadges}>{badges}</div> : null}
      </div>
    </header>
  );
}
