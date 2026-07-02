import type { ReactNode } from "react";
import styles from "./StatusBadge.module.css";

export type StatusBadgeTone = "success" | "error" | "info" | "warning" | "neutral";
export type StatusBadgeVariant = "label" | "dot";

type StatusBadgeProps = {
  tone: StatusBadgeTone;
  children: ReactNode;
  className?: string;
  variant?: StatusBadgeVariant;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function statusLabel(children: ReactNode) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  return undefined;
}

export function StatusBadge({ tone, children, className, variant = "label" }: StatusBadgeProps) {
  const label = statusLabel(children);

  if (variant === "dot") {
    return (
      <span
        className={joinClassNames(styles.dot, styles[tone], className)}
        title={label}
        aria-label={label}
        role="status"
      >
        <span className={styles.dotMark} aria-hidden="true" />
        {label ? <span className="sr-only">{children}</span> : null}
      </span>
    );
  }

  return (
    <span className={joinClassNames(styles.badge, styles[tone], className)}>
      {children}
    </span>
  );
}
