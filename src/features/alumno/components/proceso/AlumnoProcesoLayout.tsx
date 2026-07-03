"use client";

import type { ReactNode } from "react";
import { PageGreeting } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import pageStyles from "@/shared/styles/PanelSectionView.module.css";
import styles from "./AlumnoProcesoShell.module.css";
import { AlumnoProcesoSubNav } from "./AlumnoProcesoSubNav";

type AlumnoProcesoLayoutProps = {
  titleId: string;
  firstName: string;
  title: string;
  description: string;
  estatus?: string;
  children: ReactNode;
};

export function AlumnoProcesoLayout({
  titleId,
  firstName,
  title,
  description,
  estatus,
  children,
}: AlumnoProcesoLayoutProps) {
  return (
    <section className={pageStyles.page} aria-labelledby={titleId}>
      <header className={styles.procesoHeader}>
        <div className={styles.procesoHeaderMain}>
          <div className={styles.procesoHeaderCopy}>
            <h1 id={titleId} className={styles.procesoTitle}>
              {title === "Mi proceso" ? <PageGreeting name={firstName} /> : title}
            </h1>
            <p className={styles.procesoDescription}>{description}</p>
          </div>

          {estatus ? <EstatusBadge estatus={estatus} /> : null}
        </div>

        <AlumnoProcesoSubNav />
        <hr className={styles.procesoDivider} />
      </header>

      {children}
    </section>
  );
}
