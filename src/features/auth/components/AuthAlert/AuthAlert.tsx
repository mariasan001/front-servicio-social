import type { ReactNode } from "react";
import styles from "./AuthAlert.module.css";

type AuthAlertProps = {
  tone?: "error" | "success" | "info";
  children: ReactNode;
  role?: "alert" | "status";
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AuthAlert({
  tone = "info",
  children,
  role = tone === "error" ? "alert" : "status",
}: AuthAlertProps) {
  return (
    <div
      className={joinClassNames(styles.alert, styles[tone])}
      role={role}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      {children}
    </div>
  );
}
