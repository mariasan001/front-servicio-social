import type { ReactNode } from "react";
import styles from "./LandingSectionHeader.module.css";

type LandingSectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  action?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
};

function joinClassNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function LandingSectionHeader({
  eyebrow,
  title,
  intro,
  action,
  tone = "light",
  align = "left",
  className,
}: LandingSectionHeaderProps) {
  const hasAction = Boolean(action);

  return (
    <header
      className={joinClassNames(
        styles.header,
        styles[tone],
        align === "center" ? styles.centered : styles.leftAligned,
        hasAction ? styles.withAction : styles.copyOnly,
        className,
      )}
    >
      <div className={styles.copy}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.intro}>{intro}</p>
      </div>

      {action ? <div className={styles.action}>{action}</div> : null}
    </header>
  );
}
