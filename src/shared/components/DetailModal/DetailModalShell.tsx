import type { ReactNode } from "react";
import styles from "@/shared/styles/DetailModal.module.css";

type DetailModalShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function DetailModalShell({ children, footer, className }: DetailModalShellProps) {
  return (
    <div className={joinClassNames(styles.modalBody, className)}>
      {children}
      {footer ? <div className={styles.footerActions}>{footer}</div> : null}
    </div>
  );
}
