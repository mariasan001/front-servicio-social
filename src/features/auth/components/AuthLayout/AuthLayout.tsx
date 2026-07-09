import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { AuthVariant } from "../../constants/hero";
import { AUTH_FOOTER_COPY, AUTH_ROUTES } from "../../constants/routes";
import { AuthHeroPanel } from "../AuthHeroPanel/AuthHeroPanel";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  children: ReactNode;
  variant: AuthVariant;
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
  backHref,
  backLabel,
}: AuthLayoutProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.heroColumn} aria-hidden="true">
        <AuthHeroPanel />
      </aside>

      <div className={styles.formColumn}>
        <header className={styles.formHeader}>
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

          {backHref && backLabel ? (
            <Link href={backHref} className={styles.backLink}>
              {backLabel}
            </Link>
          ) : null}
        </header>

        <main
          className={joinClassNames(styles.formMain, wide && styles.formMainWide)}
          id="main"
        >
          <div className={styles.formInner}>{children}</div>
        </main>

        <footer className={styles.formFooter}>
          © {new Date().getFullYear()} {AUTH_FOOTER_COPY}
        </footer>
      </div>
    </div>
  );
}
