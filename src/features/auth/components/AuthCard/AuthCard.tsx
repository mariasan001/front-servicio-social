import type { ReactNode } from "react";
import styles from "./AuthCard.module.css";

type AuthCardProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  children: ReactNode;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  align = "center",
  children,
}: AuthCardProps) {
  return (
    <section className={styles.card} aria-labelledby="auth-card-title">
      <header
        className={joinClassNames(
          styles.header,
          align === "center" && styles.headerCenter,
        )}
      >
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h1 id="auth-card-title" className={styles.title}>
          {title}
        </h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      <div className={styles.body}>{children}</div>
    </section>
  );
}
