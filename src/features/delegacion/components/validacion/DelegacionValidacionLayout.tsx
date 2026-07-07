"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/shared/components/PageHeader";
import pageStyles from "@/shared/styles/PanelSectionView.module.css";
import styles from "./DelegacionValidacionLayout.module.css";
import { DelegacionValidacionSubNav } from "./DelegacionValidacionSubNav";

type DelegacionValidacionLayoutProps = {
  titleId: string;
  description: string;
  children: ReactNode;
};

export function DelegacionValidacionLayout({
  titleId,
  description,
  children,
}: DelegacionValidacionLayoutProps) {
  return (
    <section className={pageStyles.page} aria-labelledby={titleId}>
      <header className={styles.header}>
        <PageHeader
          titleId={titleId}
          title="Validaciones"
          description={description}
        />
        <DelegacionValidacionSubNav />
        <hr className={styles.divider} />
      </header>

      {children}
    </section>
  );
}
