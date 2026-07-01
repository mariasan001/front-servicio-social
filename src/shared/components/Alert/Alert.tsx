import type { ReactNode } from "react";
import styles from "./Alert.module.css";

type AlertTone = "error" | "success" | "info";

type AlertProps = {
  tone?: AlertTone;
  children: ReactNode;
  role?: "alert" | "status";
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Alert({
  tone = "info",
  children,
  role = tone === "error" ? "alert" : "status",
}: AlertProps) {
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
