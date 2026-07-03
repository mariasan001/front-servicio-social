import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import styles from "./Alert.module.css";

type AlertTone = "error" | "success" | "info" | "warning";

type AlertProps = {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  role?: "alert" | "status";
};

const TONE_ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
} as const;

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Alert({
  tone = "info",
  title,
  children,
  role = tone === "error" ? "alert" : "status",
}: AlertProps) {
  const Icon = TONE_ICONS[tone];

  return (
    <div
      className={joinClassNames(styles.alert, styles[tone])}
      role={role}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.message}>{children}</div>
      </div>
    </div>
  );
}
