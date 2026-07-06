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
import { ChartEmptyState } from "@/shared/components/ChartEmptyState";
import { DashboardDonut, DashboardRankedBarChart } from "@/shared/components/DashboardChart";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import styles from "@/shared/styles/PanelSectionView.module.css";
import dashStyles from "@/shared/styles/PanelDashboard.module.css";
import type { TitularInicioDashboardData, VacanteEstatusBreakdown } from "./titular-inicio.types";

type TitularInicioViewProps = {
  session: AuthUser;
  dashboard: TitularInicioDashboardData;
};

function VacanteEstatusDonut({ breakdown }: { breakdown: VacanteEstatusBreakdown }) {
  const segments = [
    {
      id: "captura",
      label: "En captura",
      count: breakdown.enCaptura,
      color: "var(--vacante-captura)",
      icon: Briefcase,
      iconTone: "vencido" as const,
      accentBorder: true,
    },
    {
      id: "revision",
      label: "En revisión",
      count: breakdown.enRevision,
      color: "var(--vacante-revision)",
      icon: Timer,
      iconTone: "sin" as const,
      accentBorder: true,
    },
    {
      id: "publicadas",
      label: "Publicadas",
      count: breakdown.publicadas,
      color: "var(--vacante-publicada)",
      icon: CheckCircle2,
      iconTone: "vigente" as const,
      accentBorder: true,
    },
    {
      id: "cerradas",
      label: "Cerradas",
      count: breakdown.cerradas,
      color: "var(--vacante-cerrada)",
      icon: CircleOff,
      iconTone: "sin" as const,
      accentBorder: true,
    },
  ]
    .filter((segment) => segment.count > 0)
    .map((segment) => ({
      ...segment,
      countLabel: `${segment.count} ${segment.count === 1 ? "vacante" : "vacantes"}`,
    }));

  return (
    <DashboardDonut
      segments={segments}
      centerLabel="Vacantes"
      ariaLabel={`Vacantes: ${breakdown.enCaptura} en captura, ${breakdown.enRevision} en revisión, ${breakdown.publicadas} publicadas y ${breakdown.cerradas} cerradas.`}
      className={dashStyles.procesoPipelineChart}
      style={{
        ["--vacante-captura" as string]: "#b8956a",
        ["--vacante-revision" as string]: "#6b2340",
        ["--vacante-publicada" as string]: "#3a5c47",
        ["--vacante-cerrada" as string]: "#d4d4d4",
      }}
      emptyState={
        <ChartEmptyState
          title="Sin vacantes registradas"
          description="Crea tu primera vacante en la sección Vacantes para comenzar a recibir postulaciones en tu área."
        />
      }
    />
  );
}

function PostulacionEstatusChart({
  items,
}: {
  items: TitularInicioDashboardData["postulacionesPorEstatus"];
}) {
  return (
    <DashboardRankedBarChart
      items={items.map((item) => ({
        id: item.nombre,
        label: item.nombre,
        count: item.count,
      }))}
      emptyState={
        <ChartEmptyState
          title="Sin postulaciones aún"
          description="Cuando publiques vacantes y los alumnos se postulen, aquí verás cuántas hay en cada estatus."
        />
      }
    />
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
        <StatCards columns={4} compact aria-live="polite">
          <StatCard
            tone="neutral"
            icon={Briefcase}
            value={stats.vacantes.total}
            label="Vacantes"
            hint={
              stats.vacantes.total === 0
                ? "Publica tu primera vacante para abrir convocatorias"
                : `${stats.vacantes.publicadas} publicadas`
            }
          />
          <StatCard
            tone="warning"
            icon={ClipboardList}
            value={stats.postulaciones.total}
            label="Postulaciones"
            hint={
              stats.postulaciones.total === 0
                ? "Aparecerán cuando haya vacantes publicadas"
                : `${stats.postulaciones.pendientes} pendientes`
            }
          />
          <StatCard
            tone="success"
            icon={FileText}
            value={stats.procesos.total}
            label="Procesos"
            hint={
              stats.procesos.total === 0
                ? "Inician al aceptar postulaciones de alumnos"
                : `${stats.procesos.activos} activos`
            }
          />
          <StatCard
            tone="info"
            icon={Shield}
            value={stats.incidencias.total}
            label="Incidencias"
            hint={
              stats.incidencias.total === 0
                ? "Sin eventos reportados en tu área"
                : `${stats.incidencias.abiertas} abiertas`
            }
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
