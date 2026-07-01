import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AUTH_ROUTES } from "../../constants/routes";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  children: ReactNode;
  wide?: boolean;
  backHref?: string;
  backLabel?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AuthLayout({
  children,
  wide = false,
  backHref = AUTH_ROUTES.home,
  backLabel = "Volver al inicio",
}: AuthLayoutProps) {
  return (
    <div className={styles.authPage}>
      <header className={styles.header}>
        <Link href={AUTH_ROUTES.home} className={styles.logoLink} aria-label="Ir al inicio">
          <Image
            className={styles.logoImage}
            src="/images/logo.webp"
            alt=""
            width={180}
            height={48}
            priority
          />
        </Link>

        <Link href={backHref} className={styles.backLink}>
          {backLabel}
        </Link>
      </header>

      <main className={styles.main} id="main">
        <div
          className={joinClassNames(styles.inner, wide && styles.innerWide)}
        >
          {children}
        </div>
      </main>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} Plataforma de Control y Seguimiento de
        Servicio Social y Residencia — Gobierno del Estado de México
      </footer>
    </div>
  );
}
