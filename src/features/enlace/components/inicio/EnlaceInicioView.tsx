import {
  Activity,
  CheckCircle2,
  CircleOff,
  GraduationCap,
  Timer,
} from "lucide-react";
import type { AuthUser } from "@/lib/api/types";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import styles from "@/shared/styles/PanelSectionView.module.css";
import dashStyles from "@/shared/styles/PanelDashboard.module.css";
import type { DashboardResumenResponse } from "../../types/enlace.types";

type EnlaceInicioViewProps = {
  session: AuthUser;
  resumen: DashboardResumenResponse;
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

function ProcesosDonut({ resumen }: { resumen: DashboardResumenResponse }) {
  const activos = resumen.procesosActivos ?? 0;
  const liberados = resumen.liberados ?? 0;
  const pendientesLiberacion = resumen.pendientesLiberacion ?? 0;
  const bajas = resumen.bajasCancelaciones ?? 0;
  const total = activos + liberados + pendientesLiberacion + bajas;

  if (total === 0) {
    return <p className={dashStyles.emptyChart}>Aún no hay procesos registrados en tu escuela.</p>;
  }

  const segments = [
    {
      id: "activos",
      label: "Activos",
      count: activos,
      percent: percent(activos, total),
      color: "var(--enlace-proceso-activo)",
      icon: Activity,
      iconClass: dashStyles.convenioIconVigente,
    },
    {
      id: "liberados",
      label: "Liberados",
      count: liberados,
      percent: percent(liberados, total),
      color: "var(--enlace-proceso-liberado)",
      icon: CheckCircle2,
      iconClass: dashStyles.convenioIconVigente,
    },
    {
      id: "pendientes",
      label: "Pend. liberación",
      count: pendientesLiberacion,
      percent: percent(pendientesLiberacion, total),
      color: "var(--enlace-proceso-pendiente)",
      icon: Timer,
      iconClass: dashStyles.convenioIconVencido,
    },
    {
      id: "bajas",
      label: "Bajas / cancel.",
      count: bajas,
      percent: percent(bajas, total),
      color: "var(--enlace-proceso-baja)",
      icon: CircleOff,
      iconClass: dashStyles.convenioIconSin,
    },
  ].filter((segment) => segment.count > 0);

  const arcs = buildDonutArcs(segments.map((segment) => ({ value: segment.count, color: segment.color })));

  return (
    <div
      className={dashStyles.convenioChart}
      style={{
        ["--enlace-proceso-activo" as string]: "#3a5c47",
        ["--enlace-proceso-liberado" as string]: "#6b2340",
        ["--enlace-proceso-pendiente" as string]: "#b8956a",
        ["--enlace-proceso-baja" as string]: "#d4d4d4",
      }}
    >
      <div
        className={dashStyles.convenioVisual}
        role="img"
        aria-label={`Procesos: ${activos} activos, ${liberados} liberados, ${pendientesLiberacion} pendientes de liberación y ${bajas} bajas o cancelaciones.`}
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
              <span className={dashStyles.convenioTotalLabel}>Procesos</span>
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
                ["--metric-index" as string]: index,
                ["--metric-accent" as string]: segment.color,
              }}
            >
              <div className={dashStyles.convenioMetricHead}>
                <span className={`${dashStyles.convenioIcon} ${segment.iconClass}`}>
                  <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className={dashStyles.convenioMetricLabel}>{segment.label}</span>
              </div>
              <span className={dashStyles.convenioMetricValue}>{segment.percent}%</span>
              <span className={dashStyles.convenioMetricCount}>{segment.count} procesos</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeguimientoChart({ resumen }: { resumen: DashboardResumenResponse }) {
  const items = [
    { nombre: "Documentación observada", count: resumen.documentacionObservada ?? 0 },
    { nombre: "Horas completas", count: resumen.horasCompletas ?? 0 },
    { nombre: "Pendientes de liberación", count: resumen.pendientesLiberacion ?? 0 },
  ].filter((item) => item.count > 0);

  if (items.length === 0) {
    return (
      <div className={dashStyles.emptyChartState}>
        <p className={dashStyles.emptyChartTitle}>Sin pendientes</p>
        <p className={dashStyles.emptyChartHint}>
          No hay observaciones de documentación, horas por completar ni liberaciones en curso en
          tu escuela.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...items.map((item) => item.count));
  const barTones = ["vino", "dorado", "verde", "vino"] as const;

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

export function EnlaceInicioView({ session, resumen }: EnlaceInicioViewProps) {
  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;

  return (
    <section
      className={`${styles.page} ${dashStyles.inicioPage}`}
      aria-labelledby="enlace-inicio-title"
    >
      <PageHeader
        titleId="enlace-inicio-title"
        title={<PageGreeting name={firstName} />}
        description="Panel de enlace escolar con el resumen visual de alumnos, procesos y seguimiento documental de tu institución."
      />

      <div className={dashStyles.dashboard}>
        <StatCards aria-live="polite">
          <StatCard
            tone="neutral"
            icon={GraduationCap}
            value={resumen.totalAlumnos ?? 0}
            label="Alumnos"
            hint={`${resumen.procesosActivos ?? 0} con proceso activo`}
          />
          <StatCard
            tone="success"
            icon={Activity}
            value={resumen.procesosActivos ?? 0}
            label="Procesos activos"
            hint={`${resumen.horasCompletas ?? 0} con horas completas`}
          />
          <StatCard
            tone="info"
            icon={CheckCircle2}
            value={resumen.liberados ?? 0}
            label="Liberados"
            hint={`${resumen.pendientesLiberacion ?? 0} pendientes de liberación`}
          />
        </StatCards>

        <div className={dashStyles.chartsGrid}>
          <article
            className={`${dashStyles.chartCard} ${dashStyles.chartCardAnimated}`}
            aria-labelledby="enlace-procesos-chart-title"
          >
            <header className={dashStyles.chartHeader}>
              <h2 id="enlace-procesos-chart-title" className={dashStyles.chartTitle}>
                Procesos por etapa
              </h2>
              <p className={dashStyles.chartDescription}>
                Distribución de procesos activos, liberados, pendientes y bajas en tu escuela.
              </p>
            </header>
            <ProcesosDonut resumen={resumen} />
          </article>

          <article
            className={`${dashStyles.chartCard} ${dashStyles.chartCardAnimated} ${dashStyles.chartCardDelayed}`}
            aria-labelledby="enlace-seguimiento-chart-title"
          >
            <header className={dashStyles.chartHeader}>
              <h2 id="enlace-seguimiento-chart-title" className={dashStyles.chartTitle}>
                Indicadores de seguimiento
              </h2>
              <p className={dashStyles.chartDescription}>
                Horas, documentación observada y liberación con mayor volumen registrado.
              </p>
            </header>
            <SeguimientoChart resumen={resumen} />
          </article>
        </div>
      </div>
    </section>
  );
}
