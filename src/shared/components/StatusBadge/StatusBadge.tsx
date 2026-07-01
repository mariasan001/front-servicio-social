import type { ReactNode } from "react";
import styles from "./StatusBadge.module.css";

export type StatusBadgeTone = "success" | "error" | "info" | "warning" | "neutral";

type StatusBadgeProps = {
  tone: StatusBadgeTone;
  children: ReactNode;
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span className={joinClassNames(styles.badge, styles[tone], className)}>
      {children}
    </span>
  );
}
