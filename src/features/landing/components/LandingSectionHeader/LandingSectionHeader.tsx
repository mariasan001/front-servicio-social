import type { ReactNode } from "react";
import styles from "./LandingSectionHeader.module.css";

type LandingSectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  intro: string;
  action?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  copyClassName?: string;
  actionClassName?: string;
  titleAs?: "h1" | "h2";
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
  copyClassName,
  actionClassName,
  titleAs = "h2",
}: LandingSectionHeaderProps) {
  const hasAction = Boolean(action);
  const TitleTag = titleAs;

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
      <div className={joinClassNames(styles.copy, copyClassName)}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <TitleTag className={styles.title}>{title}</TitleTag>
        <p className={styles.intro}>{intro}</p>
      </div>

      {action ? (
        <div className={joinClassNames(styles.action, actionClassName)}>{action}</div>
      ) : null}
    </header>
  );
}
