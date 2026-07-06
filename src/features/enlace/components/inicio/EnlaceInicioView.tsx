import {
  Activity,
  CheckCircle2,
  CircleOff,
  GraduationCap,
  Timer,
} from "lucide-react";
import type { AuthUser } from "@/lib/api/types";
import { ChartEmptyState } from "@/shared/components/ChartEmptyState";
import { DashboardDonut, DashboardRankedBarChart } from "@/shared/components/DashboardChart";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import styles from "@/shared/styles/PanelSectionView.module.css";
import dashStyles from "@/shared/styles/PanelDashboard.module.css";
import type { DashboardResumenResponse } from "../../types/enlace.types";

type EnlaceInicioViewProps = {
  session: AuthUser;
  resumen: DashboardResumenResponse;
};

function ProcesosDonut({ resumen }: { resumen: DashboardResumenResponse }) {
  const activos = resumen.procesosActivos ?? 0;
  const liberados = resumen.liberados ?? 0;
  const pendientesLiberacion = resumen.pendientesLiberacion ?? 0;
  const bajas = resumen.bajasCancelaciones ?? 0;

  const segments = [
    {
      id: "activos",
      label: "Activos",
      count: activos,
      color: "var(--enlace-proceso-activo)",
      icon: Activity,
      iconTone: "vigente" as const,
      countLabel: `${activos} procesos`,
    },
    {
      id: "liberados",
      label: "Liberados",
      count: liberados,
      color: "var(--enlace-proceso-liberado)",
      icon: CheckCircle2,
      iconTone: "vigente" as const,
      countLabel: `${liberados} procesos`,
    },
    {
      id: "pendientes",
      label: "Pend. liberación",
      count: pendientesLiberacion,
      color: "var(--enlace-proceso-pendiente)",
      icon: Timer,
      iconTone: "vencido" as const,
      countLabel: `${pendientesLiberacion} procesos`,
    },
    {
      id: "bajas",
      label: "Bajas / cancel.",
      count: bajas,
      color: "var(--enlace-proceso-baja)",
      icon: CircleOff,
      iconTone: "sin" as const,
      countLabel: `${bajas} procesos`,
    },
  ].filter((segment) => segment.count > 0);

  return (
    <DashboardDonut
      segments={segments}
      centerLabel="Procesos"
      ariaLabel={`Procesos: ${activos} activos, ${liberados} liberados, ${pendientesLiberacion} pendientes de liberación y ${bajas} bajas o cancelaciones.`}
      style={{
        ["--enlace-proceso-activo" as string]: "#3a5c47",
        ["--enlace-proceso-liberado" as string]: "#6b2340",
        ["--enlace-proceso-pendiente" as string]: "#b8956a",
        ["--enlace-proceso-baja" as string]: "#d4d4d4",
      }}
      emptyState={
        <ChartEmptyState
          title="Sin procesos registrados"
          description="Aún no hay procesos registrados en tu escuela."
        />
      }
    />
  );
}

function SeguimientoChart({ resumen }: { resumen: DashboardResumenResponse }) {
  const items = [
    { id: "documentacion", nombre: "Documentación observada", count: resumen.documentacionObservada ?? 0 },
    { id: "horas", nombre: "Horas completas", count: resumen.horasCompletas ?? 0 },
    { id: "liberacion", nombre: "Pendientes de liberación", count: resumen.pendientesLiberacion ?? 0 },
  ].filter((item) => item.count > 0);

  return (
    <DashboardRankedBarChart
      items={items.map((item) => ({
        id: item.id,
        label: item.nombre,
        count: item.count,
      }))}
      emptyState={
        <ChartEmptyState
          title="Sin pendientes"
          description="No hay observaciones de documentación, horas por completar ni liberaciones en curso en tu escuela."
        />
      }
    />
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
