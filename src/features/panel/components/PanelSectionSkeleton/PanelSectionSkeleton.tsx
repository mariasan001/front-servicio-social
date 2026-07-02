"use client";

import { AppSkeletonTheme, Skeleton } from "@/shared/components/Skeleton";
import styles from "./PanelSectionSkeleton.module.css";

function StatCardSkeleton() {
  return (
    <article className={styles.statCard} aria-hidden="true">
      <div className={styles.statCardHead}>
        <Skeleton width={88} height={14} borderRadius={6} />
        <Skeleton circle width={32} height={32} />
      </div>
      <Skeleton width={72} height={30} borderRadius={8} />
      <Skeleton width={112} height={12} borderRadius={6} />
    </article>
  );
}

function TableRowSkeleton({ dense = false }: { dense?: boolean }) {
  return (
    <div className={dense ? styles.tableRowDense : styles.tableRow} aria-hidden="true">
      <Skeleton width="30%" height={14} borderRadius={6} />
      <Skeleton width="22%" height={14} borderRadius={6} />
      <Skeleton width="18%" height={14} borderRadius={6} />
      <Skeleton width="12%" height={24} borderRadius={999} />
      <Skeleton width={36} height={36} borderRadius={8} />
    </div>
  );
}

export function PanelSectionSkeleton() {
  return (
    <AppSkeletonTheme>
      <section className={styles.page} aria-busy="true" aria-label="Cargando contenido">
        <header className={styles.header}>
          <Skeleton width={220} height={30} borderRadius={8} />
          <Skeleton width="min(100%, 34rem)" height={14} borderRadius={6} />
          <Skeleton width="min(100%, 26rem)" height={14} borderRadius={6} />
        </header>

        <div className={styles.statGrid}>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchField}>
            <Skeleton width={72} height={11} borderRadius={4} />
            <Skeleton height={36} borderRadius={7} />
          </div>
          <div className={styles.filterField}>
            <Skeleton width={56} height={11} borderRadius={4} />
            <Skeleton height={36} borderRadius={7} />
          </div>
          <Skeleton className={styles.toolbarAction} height={36} borderRadius={7} />
        </div>

        <div className={styles.tableCard}>
          <TableRowSkeleton dense />
          <div className={styles.tableBody}>
            {Array.from({ length: 7 }, (_, index) => (
              <TableRowSkeleton key={index} />
            ))}
          </div>
        </div>

        <div className={styles.chartsGrid} aria-hidden="true">
          <article className={styles.chartCard}>
            <Skeleton width={160} height={16} borderRadius={6} />
            <Skeleton className={styles.chartDonut} circle width={148} height={148} />
            <div className={styles.chartLegend}>
              <Skeleton width="72%" height={12} borderRadius={6} />
              <Skeleton width="64%" height={12} borderRadius={6} />
              <Skeleton width="68%" height={12} borderRadius={6} />
            </div>
          </article>

          <article className={styles.chartCard}>
            <Skeleton width={180} height={16} borderRadius={6} />
            <div className={styles.barChart}>
              {[72, 108, 86, 124, 96].map((height, index) => (
                <Skeleton key={index} className={styles.bar} height={height} borderRadius={6} />
              ))}
            </div>
          </article>
        </div>
      </section>
    </AppSkeletonTheme>
  );
}
