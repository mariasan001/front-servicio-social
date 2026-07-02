import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  className?: string;
  embedded?: boolean;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  className,
  embedded = false,
}: EmptyStateProps) {
  return (
    <div
      className={joinClassNames(styles.emptyState, embedded && styles.embedded, className)}
      aria-live="polite"
    >
      <div className={styles.content}>
        {Icon ? (
          <div className={styles.iconWrap} aria-hidden="true">
            <Icon size={22} strokeWidth={1.75} />
          </div>
        ) : null}

        <div className={styles.copy}>
          <p className={styles.title}>{title}</p>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
