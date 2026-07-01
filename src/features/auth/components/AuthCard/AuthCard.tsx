import type { ReactNode } from "react";
import styles from "./AuthCard.module.css";

type AuthCardProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ eyebrow, title, subtitle, children }: AuthCardProps) {
  return (
    <section className={styles.card} aria-labelledby="auth-card-title">
      <header className={styles.header}>
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
