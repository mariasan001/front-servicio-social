import { AppSkeletonTheme, Skeleton } from "@/shared/components/Skeleton";
import styles from "@/shared/styles/DetailModal.module.css";

type EntityDetailModalSkeletonProps = {
  metaRows?: number;
  sections?: number;
};

export function EntityDetailModalSkeleton({
  metaRows = 4,
  sections = 1,
}: EntityDetailModalSkeletonProps) {
  return (
    <AppSkeletonTheme>
      <div className={styles.modalBody} aria-busy="true" aria-label="Cargando información">
        <div className={styles.skeletonHero}>
          <Skeleton circle width={72} height={72} />
          <Skeleton width={200} height={16} borderRadius={6} />
          <Skeleton width={160} height={12} borderRadius={6} />
        </div>

        <div className={styles.skeletonMeta}>
          {Array.from({ length: metaRows }, (_, index) => (
            <div key={index} className={styles.skeletonMetaRow}>
              <Skeleton width={88} height={10} borderRadius={4} />
              <Skeleton width={`${52 + index * 8}%`} height={14} borderRadius={6} />
            </div>
          ))}
        </div>

        {Array.from({ length: sections }, (_, index) => (
          <div key={index} className={styles.contentPanel}>
            <Skeleton width={120} height={10} borderRadius={4} />
            <Skeleton width="78%" height={12} borderRadius={6} />
            <Skeleton height={52} borderRadius={8} />
          </div>
        ))}
      </div>
    </AppSkeletonTheme>
  );
}
