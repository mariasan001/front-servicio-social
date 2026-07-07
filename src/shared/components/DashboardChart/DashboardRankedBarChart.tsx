import type { ReactNode } from "react";
import dashStyles from "@/shared/styles/PanelDashboard.module.css";
import { percent } from "./dashboard-chart.utils";

export type RankedBarItem = {
  id: string;
  label: string;
  count: number;
};

type DashboardRankedBarChartProps = {
  items: RankedBarItem[];
  totalForShare?: number;
  ariaLabel?: string;
  emptyState?: ReactNode;
  showShare?: boolean;
  /** Máximo de filas visibles; el resto se resume en pie de lista. */
  maxItems?: number;
  /** A partir de cuántas filas la lista hace scroll dentro de la tarjeta. */
  scrollAfter?: number;
  /** Etiqueta para el pie cuando hay filas ocultas por `maxItems`. */
  overflowItemLabel?: string;
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function DashboardRankedBarChart({
  items,
  totalForShare,
  ariaLabel,
  emptyState,
  showShare = false,
  maxItems,
  scrollAfter = 6,
  overflowItemLabel = "elementos",
}: DashboardRankedBarChartProps) {
  if (items.length === 0) {
    return emptyState ?? null;
  }

  const visibleItems = maxItems ? items.slice(0, maxItems) : items;
  const hiddenCount = maxItems ? Math.max(0, items.length - maxItems) : 0;
  const maxCount = Math.max(...visibleItems.map((item) => item.count));
  const shareTotal =
    totalForShare ?? visibleItems.reduce((sum, item) => sum + item.count, 0);
  const isScrollable = visibleItems.length > scrollAfter;

  return (
    <div
      className={dashStyles.depAreasChart}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      <div
        className={joinClassNames(
          dashStyles.depAreasList,
          isScrollable && dashStyles.depAreasListScrollable,
        )}
      >
        {visibleItems.map((item, index) => {
          const width = percent(item.count, maxCount);
          const share =
            showShare && shareTotal > 0 ? percent(item.count, shareTotal) : undefined;

          return (
            <div
              key={item.id}
              className={dashStyles.depAreasRow}
              style={{ ["--row-index" as string]: index }}
            >
              <span
                className={dashStyles.depAreasRank}
                data-rank={index === 0 ? "top" : "default"}
              >
                {index + 1}
              </span>

              <div className={dashStyles.depAreasBody}>
                <div className={dashStyles.depAreasHead}>
                  <p className={dashStyles.depAreasName} title={item.label}>
                    {item.label}
                  </p>
                  <div className={dashStyles.depAreasMetrics}>
                    <span className={dashStyles.depAreasCount}>{item.count}</span>
                    {share !== undefined ? (
                      <span className={dashStyles.depAreasShare}>{share}%</span>
                    ) : null}
                  </div>
                </div>

                <div className={dashStyles.depAreasTrack} aria-hidden="true">
                  <div
                    className={dashStyles.depAreasFill}
                    data-rank={index === 0 ? "top" : "default"}
                    style={{
                      ["--bar-width" as string]: `${width}%`,
                      ["--bar-delay" as string]: `${0.18 + index * 0.1}s`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hiddenCount > 0 ? (
        <p className={dashStyles.depAreasOverflow}>
          +{hiddenCount} {overflowItemLabel} más sin mostrar
        </p>
      ) : null}
    </div>
  );
}
