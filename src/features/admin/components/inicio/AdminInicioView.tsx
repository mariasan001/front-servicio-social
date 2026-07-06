import { Building2, CircleOff, FileCheck2, Layers, School, TimerOff, Users } from "lucide-react";
import type { AuthUser } from "@/lib/api/types";
import { ChartEmptyState } from "@/shared/components/ChartEmptyState";
import {
  DashboardDonut,
  DashboardRankedBarChart,
  type DashboardDonutSegment,
} from "@/shared/components/DashboardChart";
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

function buildConvenioSegments(convenio: ConvenioBreakdown): DashboardDonutSegment[] {
  return [
    {
      id: "sin",
      label: "Sin convenio",
      count: convenio.sinConvenio,
      color: "var(--convenio-sin)",
      icon: CircleOff,
      iconTone: "sin",
      countLabel: `${convenio.sinConvenio} ${convenio.sinConvenio === 1 ? "escuela" : "escuelas"}`,
    },
    {
      id: "vigente",
      label: "Vigente",
      count: convenio.vigente,
      color: "var(--convenio-vigente)",
      icon: FileCheck2,
      iconTone: "vigente",
      countLabel: `${convenio.vigente} ${convenio.vigente === 1 ? "escuela" : "escuelas"}`,
    },
    {
      id: "vencido",
      label: "Vencido",
      count: convenio.vencido,
      color: "var(--convenio-vencido)",
      icon: TimerOff,
      iconTone: "vencido",
      countLabel: `${convenio.vencido} ${convenio.vencido === 1 ? "escuela" : "escuelas"}`,
    },
  ];
}

function ConvenioDonut({ convenio }: { convenio: ConvenioBreakdown }) {
  const segments = buildConvenioSegments(convenio);

  return (
    <DashboardDonut
      segments={segments}
      centerLabel="Escuelas"
      ariaLabel={`Convenios: ${convenio.sinConvenio} sin convenio, ${convenio.vigente} vigentes y ${convenio.vencido} vencidos.`}
      emptyState={
        <ChartEmptyState
          title="Sin escuelas registradas"
          description="Cuando registres instituciones educativas, aquí verás el estado de sus convenios."
        />
      }
    />
  );
}

function DependenciaAreasChart({
  items,
  totalAreas,
}: {
  items: DependenciaAreaCount[];
  totalAreas: number;
}) {
  return (
    <DashboardRankedBarChart
      items={items.map((item) => ({
        id: item.nombre,
        label: item.nombre,
        count: item.count,
      }))}
      totalForShare={totalAreas}
      showShare
      ariaLabel={items
        .map((item, index) => `${index + 1}. ${item.nombre}: ${item.count} áreas`)
        .join(". ")}
      emptyState={
        <ChartEmptyState
          title="Sin áreas registradas"
          description="Cuando registres áreas receptoras en las dependencias, aquí verás el ranking por volumen."
        />
      }
    />
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
