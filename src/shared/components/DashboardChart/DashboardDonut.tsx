import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import dashStyles from "@/shared/styles/PanelDashboard.module.css";
import {
  DONUT_RADIUS,
  DONUT_STROKE,
  buildDonutArcs,
  percent,
} from "./dashboard-chart.utils";

export type DonutMetricTone = "sin" | "vigente" | "vencido";

export type DashboardDonutSegment = {
  id: string;
  label: string;
  count: number;
  color: string;
  icon: LucideIcon;
  iconTone?: DonutMetricTone;
  countLabel?: string;
  accentBorder?: boolean;
};

type DashboardDonutProps = {
  segments: DashboardDonutSegment[];
  centerLabel: string;
  ariaLabel: string;
  emptyState?: ReactNode;
  className?: string;
  style?: CSSProperties;
  showRings?: boolean;
};

const iconToneClass: Record<DonutMetricTone, string> = {
  sin: dashStyles.convenioIconSin,
  vigente: dashStyles.convenioIconVigente,
  vencido: dashStyles.convenioIconVencido,
};

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function DashboardDonut({
  segments,
  centerLabel,
  ariaLabel,
  emptyState,
  className,
  style,
  showRings = true,
}: DashboardDonutProps) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);

  if (total === 0) {
    return emptyState ?? null;
  }

  const arcs = buildDonutArcs(
    segments.map((segment) => ({ value: segment.count, color: segment.color })),
  );

  const metricsClass =
    segments.length > 3
      ? joinClassNames(dashStyles.convenioMetrics, dashStyles.convenioMetricsFour)
      : dashStyles.convenioMetrics;

  return (
    <div className={joinClassNames(dashStyles.convenioChart, className)} style={style}>
      <div className={dashStyles.convenioVisual} role="img" aria-label={ariaLabel}>
        <div className={dashStyles.convenioStage}>
          {showRings ? (
            <div className={dashStyles.convenioRings} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          ) : null}

          <div className={dashStyles.convenioDonutWrap}>
            <svg className={dashStyles.convenioSvg} viewBox="0 0 160 160" aria-hidden="true">
              <circle
                className={dashStyles.donutTrack}
                cx="80"
                cy="80"
                r={DONUT_RADIUS}
                fill="none"
                strokeWidth={DONUT_STROKE}
              />
              {arcs.map((arc, index) => (
                <circle
                  key={index}
                  className={dashStyles.donutArc}
                  cx="80"
                  cy="80"
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={DONUT_STROKE}
                  strokeLinecap="round"
                  style={{
                    ["--arc-length" as string]: `${arc.length}`,
                    ["--arc-delay" as string]: `${arc.delay}s`,
                    transform: `rotate(${arc.rotation}deg)`,
                    transformOrigin: "80px 80px",
                  }}
                />
              ))}
            </svg>
            <div className={dashStyles.convenioHole}>
              <span className={dashStyles.convenioTotal}>{total}</span>
              <span className={dashStyles.convenioTotalLabel}>{centerLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={metricsClass}>
        {segments.map((segment, index) => {
          const Icon = segment.icon;
          const share = percent(segment.count, total);
          const tone = segment.iconTone ?? "vigente";

          return (
            <div
              key={segment.id}
              className={dashStyles.convenioMetric}
              data-tone={segment.iconTone}
              style={{
                ...(segment.accentBorder ? { borderTop: `2px solid ${segment.color}` } : undefined),
                ["--metric-index" as string]: index,
                ["--metric-accent" as string]: segment.color,
              }}
            >
              <div className={dashStyles.convenioMetricHead}>
                <span className={joinClassNames(dashStyles.convenioIcon, iconToneClass[tone])}>
                  <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className={dashStyles.convenioMetricLabel}>{segment.label}</span>
              </div>
              <span className={dashStyles.convenioMetricValue}>{share}%</span>
              <span className={dashStyles.convenioMetricCount}>
                {segment.countLabel ?? String(segment.count)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
