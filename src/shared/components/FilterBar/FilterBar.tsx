import type { ReactNode } from "react";
import styles from "./FilterBar.module.css";

type FilterBarProps = {
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function FilterBar({ children, actions, className }: FilterBarProps) {
  if (!children && !actions) {
    return null;
  }

  return (
    <div className={joinClassNames(styles.filterBar, className)}>
      {children ? <div className={styles.filters}>{children}</div> : <span />}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
