import { Building2, CircleOff, FileCheck2, Layers, School, TimerOff, Users } from "lucide-react";
import type { AuthUser } from "@/lib/api/types";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import styles from "@/shared/styles/PanelSectionView.module.css";
import dashStyles from "@/shared/styles/PanelDashboard.module.css";
import type {
  AdminInicioDashboardData,
  ConvenioBreakdown,
  DependenciaAreaCount,
} from "./admin-inicio.types";

type AdminInicioViewProps = {
  session: AuthUser;
  dashboard: AdminInicioDashboardData;
};

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

type ConvenioSegment = {
  id: string;
  label: string;
  count: number;
  percent: number;
  tone: "sin" | "vigente" | "vencido";
};

const DONUT_RADIUS = 58;
const DONUT_STROKE = 18;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

type DonutArc = {
  color: string;
  length: number;
  rotation: number;
  delay: number;
};

function buildDonutArcs(
  sin: number,
  vigente: number,
  vencido: number,
): DonutArc[] {
  const total = sin + vigente + vencido;
  const items = [
    { value: sin, color: "var(--convenio-sin)" },
    { value: vigente, color: "var(--convenio-vigente)" },
    { value: vencido, color: "var(--convenio-vencido)" },
  ];

  let rotation = -90;

  return items
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

function ConvenioDonut({ convenio }: { convenio: ConvenioBreakdown }) {
  const total = convenio.sinConvenio + convenio.vigente + convenio.vencido;

  if (total === 0) {
    return <p className={dashStyles.emptyChart}>Aún no hay escuelas registradas.</p>;
  }

  const arcs = buildDonutArcs(convenio.sinConvenio, convenio.vigente, convenio.vencido);

  const segments: ConvenioSegment[] = [
    {
      id: "sin",
      label: "Sin convenio",
      count: convenio.sinConvenio,
      percent: percent(convenio.sinConvenio, total),
      tone: "sin",
    },
    {
      id: "vigente",
      label: "Vigente",
      count: convenio.vigente,
      percent: percent(convenio.vigente, total),
      tone: "vigente",
    },
    {
      id: "vencido",
      label: "Vencido",
      count: convenio.vencido,
      percent: percent(convenio.vencido, total),
      tone: "vencido",
    },
  ];

  const iconToneClass = {
    sin: dashStyles.convenioIconSin,
    vigente: dashStyles.convenioIconVigente,
    vencido: dashStyles.convenioIconVencido,
  } as const;

  const icons = {
    sin: CircleOff,
    vigente: FileCheck2,
    vencido: TimerOff,
  } as const;

  return (
    <div className={dashStyles.convenioChart}>
      <div
        className={dashStyles.convenioVisual}
        role="img"
        aria-label={`Convenios: ${convenio.sinConvenio} sin convenio, ${convenio.vigente} vigentes y ${convenio.vencido} vencidos.`}
      >
        <div className={dashStyles.convenioStage}>
          <div className={dashStyles.convenioRings} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className={dashStyles.convenioDonutWrap}>
            <svg
              className={dashStyles.convenioSvg}
              viewBox="0 0 160 160"
              aria-hidden="true"
            >
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
              <span className={dashStyles.convenioTotalLabel}>Escuelas</span>
            </div>
          </div>
        </div>
      </div>

      <div className={dashStyles.convenioMetrics}>
        {segments.map((segment, index) => {
          const Icon = icons[segment.tone];

          return (
            <div
              key={segment.id}
              className={dashStyles.convenioMetric}
              data-tone={segment.tone}
              style={{ ["--metric-index" as string]: index }}
            >
              <div className={dashStyles.convenioMetricHead}>
                <span className={`${dashStyles.convenioIcon} ${iconToneClass[segment.tone]}`}>
                  <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className={dashStyles.convenioMetricLabel}>{segment.label}</span>
              </div>
              <span className={dashStyles.convenioMetricValue}>{segment.percent}%</span>
              <span className={dashStyles.convenioMetricCount}>{segment.count} escuelas</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DependenciaAreasChart({
  items,
  totalAreas,
}: {
  items: DependenciaAreaCount[];
  totalAreas: number;
}) {
  if (items.length === 0) {
    return <p className={dashStyles.emptyChart}>Aún no hay áreas registradas.</p>;
  }

  const maxCount = Math.max(...items.map((item) => item.count));

  return (
    <div
      className={dashStyles.depAreasChart}
      role="img"
      aria-label={items
        .map((item, index) => `${index + 1}. ${item.nombre}: ${item.count} áreas`)
        .join(". ")}
    >
      <div className={dashStyles.depAreasList}>
        {items.map((item, index) => {
          const width = percent(item.count, maxCount);
          const share = percent(item.count, totalAreas);

          return (
            <div
              key={item.nombre}
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
                  <p className={dashStyles.depAreasName} title={item.nombre}>
                    {item.nombre}
                  </p>
                  <div className={dashStyles.depAreasMetrics}>
                    <span className={dashStyles.depAreasCount}>{item.count}</span>
                    <span className={dashStyles.depAreasShare}>{share}%</span>
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

export function AdminInicioView({ session, dashboard }: AdminInicioViewProps) {
  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;
  const { stats, convenio, areasPorDependencia } = dashboard;

  return (
    <section className={`${styles.page} ${dashStyles.inicioPage}`} aria-labelledby="admin-inicio-title">
      <PageHeader
        titleId="admin-inicio-title"
        title={<PageGreeting name={firstName} />}
        description="Panel de administración con el resumen visual del catálogo institucional y el estado operativo del programa."
      />

      <div className={dashStyles.dashboard}>
        <StatCards columns={4} compact aria-live="polite">
          <StatCard
            tone="neutral"
            icon={Building2}
            value={stats.dependencias.total}
            label="Dependencias"
            hint={`${stats.dependencias.activas} activas`}
          />
          <StatCard
            tone="warning"
            icon={Layers}
            value={stats.areas.total}
            label="Áreas"
            hint={`${stats.areas.activas} activas`}
          />
          <StatCard
            tone="success"
            icon={School}
            value={stats.escuelas.total}
            label="Escuelas"
            hint={`${stats.escuelas.activas} activas`}
          />
          <StatCard
            tone="info"
            icon={Users}
            value={stats.usuarios.total}
            label="Usuarios internos"
            hint={`${stats.usuarios.activos} activos`}
          />
        </StatCards>

        <div className={dashStyles.chartsGrid}>
          <article className={`${dashStyles.chartCard} ${dashStyles.chartCardAnimated}`} aria-labelledby="convenio-chart-title">
            <header className={dashStyles.chartHeader}>
              <h2 id="convenio-chart-title" className={dashStyles.chartTitle}>
                Convenios de escuelas
              </h2>
              <p className={dashStyles.chartDescription}>
                Estado de convenio de las instituciones educativas.
              </p>
            </header>
            <ConvenioDonut convenio={convenio} />
          </article>

          <article
            className={`${dashStyles.chartCard} ${dashStyles.chartCardAnimated} ${dashStyles.chartCardDelayed}`}
            aria-labelledby="areas-dep-chart-title"
          >
            <header className={dashStyles.chartHeader}>
              <h2 id="areas-dep-chart-title" className={dashStyles.chartTitle}>
                Áreas por dependencia
              </h2>
              <p className={dashStyles.chartDescription}>
                Dependencias con mayor número de áreas receptoras.
              </p>
            </header>
            <DependenciaAreasChart
              items={areasPorDependencia}
              totalAreas={stats.areas.total}
            />
          </article>
        </div>
      </div>
    </section>
  );
}
