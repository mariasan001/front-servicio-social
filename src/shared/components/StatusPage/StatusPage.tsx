import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./StatusPage.module.css";

type StatusPageProps = {
  code?: string;
  title: string;
  message: string;
  primaryAction?: ReactNode;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function StatusPage({
  code,
  title,
  message,
  primaryAction,
  secondaryHref = "/",
  secondaryLabel = "Ir al inicio",
}: StatusPageProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink} aria-label="Ir al inicio">
          <Image
            src="/images/logo.webp"
            alt=""
            width={180}
            height={48}
            priority
          />
        </Link>
      </header>

      <main className={styles.main} id="main">
        <section className={styles.card} aria-labelledby="status-title">
          {code ? <p className={styles.code}>{code}</p> : null}
          <h1 id="status-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            {primaryAction}
            <Link href={secondaryHref} className={styles.secondaryAction}>
              {secondaryLabel}
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Gobierno del Estado de México
      </footer>
    </div>
  );
}
