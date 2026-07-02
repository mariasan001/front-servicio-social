"use client";

import {
  Briefcase,
  CheckCircle2,
  CircleOff,
  ClipboardList,
  FileText,
  Shield,
  Timer,
} from "lucide-react";
import type { AuthUser } from "@/lib/api/types";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import styles from "@/shared/styles/PanelSectionView.module.css";
import dashStyles from "@/shared/styles/PanelDashboard.module.css";
import type { TitularInicioDashboardData, VacanteEstatusBreakdown } from "./titular-inicio.types";

type TitularInicioViewProps = {
  session: AuthUser;
  dashboard: TitularInicioDashboardData;
};

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

const DONUT_RADIUS = 58;
const DONUT_STROKE = 18;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

type DonutArc = {
  color: string;
  length: number;
  rotation: number;
  delay: number;
};

function buildDonutArcs(values: { value: number; color: string }[]): DonutArc[] {
  const total = values.reduce((sum, item) => sum + item.value, 0);
  let rotation = -90;

  return values
    .map((item, index) => {
      const length = total > 0 ? (item.value / total) * DONUT_CIRCUMFERENCE : 0;
      const arc = {
        color: item.color,
        length,
        rotation,
        delay: 0.12 + index * 0.22,
      };

      rotation += (length / DONUT_CIRCUMFERENCE) * 360;

      return arc;
    })
    .filter((arc) => arc.length > 0.5);
}

function VacanteEstatusDonut({ breakdown }: { breakdown: VacanteEstatusBreakdown }) {
  const total =
    breakdown.enCaptura + breakdown.enRevision + breakdown.publicadas + breakdown.cerradas;

  if (total === 0) {
    return <p className={dashStyles.emptyChart}>Aún no hay vacantes registradas.</p>;
  }

  const segments = [
    {
      id: "captura",
      label: "En captura",
      count: breakdown.enCaptura,
      percent: percent(breakdown.enCaptura, total),
      color: "var(--vacante-captura)",
      icon: Briefcase,
      iconClass: dashStyles.convenioIconVencido,
    },
    {
      id: "revision",
      label: "En revisión",
      count: breakdown.enRevision,
      percent: percent(breakdown.enRevision, total),
      color: "var(--vacante-revision)",
      icon: Timer,
      iconClass: dashStyles.convenioIconSin,
    },
    {
      id: "publicadas",
      label: "Publicadas",
      count: breakdown.publicadas,
      percent: percent(breakdown.publicadas, total),
      color: "var(--vacante-publicada)",
      icon: CheckCircle2,
      iconClass: dashStyles.convenioIconVigente,
    },
    {
      id: "cerradas",
      label: "Cerradas",
      count: breakdown.cerradas,
      percent: percent(breakdown.cerradas, total),
      color: "var(--vacante-cerrada)",
      icon: CircleOff,
      iconClass: dashStyles.convenioIconSin,
    },
  ].filter((segment) => segment.count > 0);

  const arcs = buildDonutArcs(
    segments.map((segment) => ({ value: segment.count, color: segment.color })),
  );

  return (
    <div
      className={dashStyles.convenioChart}
      style={{
        ["--vacante-captura" as string]: "#b8956a",
        ["--vacante-revision" as string]: "#6b2340",
        ["--vacante-publicada" as string]: "#3a5c47",
        ["--vacante-cerrada" as string]: "#d4d4d4",
      }}
    >
      <div
        className={dashStyles.convenioVisual}
        role="img"
        aria-label={`Vacantes: ${breakdown.enCaptura} en captura, ${breakdown.enRevision} en revisión, ${breakdown.publicadas} publicadas y ${breakdown.cerradas} cerradas.`}
      >
        <div className={dashStyles.convenioStage}>
          <div className={dashStyles.convenioRings} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

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
              <span className={dashStyles.convenioTotalLabel}>Vacantes</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${dashStyles.convenioMetrics} ${dashStyles.convenioMetricsFour}`}>
        {segments.map((segment, index) => {
          const Icon = segment.icon;

          return (
            <div
              key={segment.id}
              className={dashStyles.convenioMetric}
              style={{
                borderTop: `2px solid ${segment.color}`,
                ["--metric-index" as string]: index,
              }}
            >
              <div className={dashStyles.convenioMetricHead}>
                <span className={`${dashStyles.convenioIcon} ${segment.iconClass}`}>
                  <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className={dashStyles.convenioMetricLabel}>{segment.label}</span>
              </div>
              <span className={dashStyles.convenioMetricValue}>{segment.percent}%</span>
              <span className={dashStyles.convenioMetricCount}>
                {segment.count} {segment.count === 1 ? "vacante" : "vacantes"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostulacionEstatusChart({
  items,
}: {
  items: TitularInicioDashboardData["postulacionesPorEstatus"];
}) {
  if (items.length === 0) {
    return <p className={dashStyles.emptyChart}>Aún no hay postulaciones registradas.</p>;
  }

  const maxCount = Math.max(...items.map((item) => item.count));
  const barTones = ["vino", "dorado", "verde", "vino", "dorado"] as const;

  return (
    <div className={dashStyles.barList}>
      {items.map((item, index) => {
        const width = percent(item.count, maxCount);

        return (
          <div
            key={item.nombre}
            className={dashStyles.barRow}
            style={{ ["--row-index" as string]: index }}
          >
            <div className={dashStyles.barMeta}>
              <span className={dashStyles.barLabel}>{item.nombre}</span>
              <span className={dashStyles.barValue}>{item.count}</span>
            </div>
            <div className={dashStyles.barTrack} aria-hidden="true">
              <div
                className={dashStyles.barFill}
                data-tone={barTones[index % barTones.length]}
                style={{
                  ["--bar-width" as string]: `${width}%`,
                  ["--bar-delay" as string]: `${0.15 + index * 0.1}s`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TitularInicioView({ session, dashboard }: TitularInicioViewProps) {
  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;
  const { stats, vacantesPorEstatus, postulacionesPorEstatus } = dashboard;

  return (
    <section
      className={`${styles.page} ${dashStyles.inicioPage}`}
      aria-labelledby="titular-inicio-title"
    >
      <PageHeader
        titleId="titular-inicio-title"
        title={<PageGreeting name={firstName} />}
        description="Panel de titular con el resumen visual de vacantes, postulaciones y procesos de tu área."
      />

      <div className={dashStyles.dashboard}>
        <StatCards className={dashStyles.statCardsFour} aria-live="polite">
          <StatCard
            tone="neutral"
            icon={Briefcase}
            value={stats.vacantes.total}
            label="Vacantes"
            hint={`${stats.vacantes.publicadas} publicadas`}
          />
          <StatCard
            tone="warning"
            icon={ClipboardList}
            value={stats.postulaciones.total}
            label="Postulaciones"
            hint={`${stats.postulaciones.pendientes} pendientes`}
          />
          <StatCard
            tone="success"
            icon={FileText}
            value={stats.procesos.total}
            label="Procesos"
            hint={`${stats.procesos.activos} activos`}
          />
          <StatCard
            tone="info"
            icon={Shield}
            value={stats.incidencias.total}
            label="Incidencias"
            hint={`${stats.incidencias.abiertas} abiertas`}
          />
        </StatCards>

        <div className={dashStyles.chartsGrid}>
          <article
            className={`${dashStyles.chartCard} ${dashStyles.chartCardAnimated}`}
            aria-labelledby="titular-vacantes-chart-title"
          >
            <header className={dashStyles.chartHeader}>
              <h2 id="titular-vacantes-chart-title" className={dashStyles.chartTitle}>
                Vacantes por estatus
              </h2>
              <p className={dashStyles.chartDescription}>
                Distribución del ciclo de vida de las vacantes de tu área.
              </p>
            </header>
            <VacanteEstatusDonut breakdown={vacantesPorEstatus} />
          </article>

          <article
            className={`${dashStyles.chartCard} ${dashStyles.chartCardAnimated} ${dashStyles.chartCardDelayed}`}
            aria-labelledby="titular-postulaciones-chart-title"
          >
            <header className={dashStyles.chartHeader}>
              <h2 id="titular-postulaciones-chart-title" className={dashStyles.chartTitle}>
                Postulaciones por estatus
              </h2>
              <p className={dashStyles.chartDescription}>
                Estatus con mayor volumen de postulaciones recibidas.
              </p>
            </header>
            <PostulacionEstatusChart items={postulacionesPorEstatus} />
          </article>
        </div>
      </div>
    </section>
  );
}
