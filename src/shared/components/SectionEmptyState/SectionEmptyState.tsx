import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "../EmptyState";
import styles from "./SectionEmptyState.module.css";

type SectionEmptyStateProps = {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  fillHeight?: boolean;
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function SectionEmptyState({
  title,
  description,
  icon,
  fillHeight = true,
  className,
}: SectionEmptyStateProps) {
  return (
    <div
      className={joinClassNames(
        styles.wrapper,
        fillHeight && styles.wrapperFill,
        className,
      )}
      data-section-empty-fill={fillHeight ? "true" : undefined}
    >
      <div className={joinClassNames(styles.body, fillHeight && styles.bodyFill)}>
        <EmptyState title={title} description={description} icon={icon} embedded />
      </div>
    </div>
  );
}
