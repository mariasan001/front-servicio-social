import Link from "next/link";
import type { ReactNode } from "react";
import type { AuthUser } from "@/lib/api/types";
import { LogoutButton } from "@/features/auth/components/LogoutButton/LogoutButton";
import styles from "./PanelShell.module.css";

type PanelShellProps = {
  user: AuthUser;
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PanelShell({
  user,
  eyebrow,
  title,
  description,
  children,
}: PanelShellProps) {
  return (
    <div className={styles.panelPage}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          Servicio Social Edomex
        </Link>
        <LogoutButton />
      </header>

      <main className={styles.main} id="main">
        <section className={styles.card} aria-labelledby="panel-title">
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 id="panel-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.description}>{description}</p>
          <p className={styles.meta}>
            Sesión iniciada como <strong>{user.nombreCompleto}</strong> (
            {user.username})
          </p>
          <div className={styles.actions}>{children}</div>
        </section>
      </main>
    </div>
  );
}
