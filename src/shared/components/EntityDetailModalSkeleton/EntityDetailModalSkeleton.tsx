import { AppSkeletonTheme, Skeleton } from "@/shared/components/Skeleton";
import styles from "./EntityDetailModalSkeleton.module.css";

type EntityDetailModalSkeletonProps = {
  sections?: number;
};

export function EntityDetailModalSkeleton({ sections = 2 }: EntityDetailModalSkeletonProps) {
  return (
    <AppSkeletonTheme>
      <div className={styles.layout} aria-busy="true" aria-label="Cargando información">
        <div className={styles.summaryBar}>
          <Skeleton circle width={40} height={40} />
          <div className={styles.summaryMeta}>
            <Skeleton width={180} height={14} borderRadius={6} />
            <Skeleton width={220} height={12} borderRadius={6} />
          </div>
          <Skeleton width={72} height={24} borderRadius={999} />
        </div>

        <div className={styles.infoPanel}>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={styles.infoItem}>
              <Skeleton width={96} height={10} borderRadius={4} />
              <Skeleton width={`${68 + index * 8}%`} height={14} borderRadius={6} />
            </div>
          ))}
        </div>

        {Array.from({ length: sections }, (_, index) => (
          <div key={index} className={styles.section}>
            <Skeleton width={140} height={12} borderRadius={4} />
            <Skeleton width="78%" height={12} borderRadius={6} />
            <Skeleton height={52} borderRadius={8} />
          </div>
        ))}
      </div>
    </AppSkeletonTheme>
  );
}
