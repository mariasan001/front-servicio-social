import type { ReactNode } from "react";
import styles from "./ChartEmptyState.module.css";

type ChartEmptyStateProps = {
  title: string;
  description?: ReactNode;
  variant?: "rich" | "simple";
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ChartEmptyState({
  title,
  description,
  variant = "rich",
  className,
}: ChartEmptyStateProps) {
  if (variant === "simple" && !description) {
    return <p className={joinClassNames(styles.simple, className)}>{title}</p>;
  }

  return (
    <div className={joinClassNames(styles.emptyState, className)} aria-live="polite">
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}
