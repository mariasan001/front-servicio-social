"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import pageStyles from "@/shared/styles/PanelSectionView.module.css";
import { getTitularSeguimientoTab, type TitularSeguimientoTab } from "../../constants/seguimiento-sections";
import styles from "./TitularSeguimientoLayout.module.css";
import { TitularSeguimientoSubNav } from "./TitularSeguimientoSubNav";

type TitularSeguimientoLayoutProps = {
  activeTab: TitularSeguimientoTab;
  children: ReactNode;
};

export function TitularSeguimientoLayout({
  activeTab,
  children,
}: TitularSeguimientoLayoutProps) {
  const tab = getTitularSeguimientoTab(activeTab);

  return (
    <section className={pageStyles.page} aria-labelledby="titular-seguimiento-title">
      <header className={styles.header}>
        <PageHeader
          titleId="titular-seguimiento-title"
          title="Alumnos"
          description={tab.description}
        />
        <TitularSeguimientoSubNav />
        <hr className={styles.divider} />
      </header>

      {children}
    </section>
  );
}
