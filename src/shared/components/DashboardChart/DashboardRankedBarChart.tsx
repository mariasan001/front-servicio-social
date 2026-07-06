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
};

export function DashboardRankedBarChart({
  items,
  totalForShare,
  ariaLabel,
  emptyState,
  showShare = false,
}: DashboardRankedBarChartProps) {
  if (items.length === 0) {
    return emptyState ?? null;
  }

  const maxCount = Math.max(...items.map((item) => item.count));

  return (
    <div
      className={dashStyles.depAreasChart}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      <div className={dashStyles.depAreasList}>
        {items.map((item, index) => {
          const width = percent(item.count, maxCount);
          const share =
            showShare && totalForShare && totalForShare > 0
              ? percent(item.count, totalForShare)
              : undefined;

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
    </div>
  );
}
