"use client";

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  CircleOff,
  ClipboardList,
  FileText,
  Timer,
  Users,
} from "lucide-react";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/api/types";
import type {
  DashboardResponse,
  LiberacionPendienteCartaResponse,
  NotificacionCorreoResponse,
} from "../../types/delegacion.types";
import { ChartEmptyState } from "@/shared/components/ChartEmptyState";
import { DashboardDonut, DashboardRankedBarChart } from "@/shared/components/DashboardChart";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import styles from "@/shared/styles/PanelSectionView.module.css";
import dashStyles from "@/shared/styles/PanelDashboard.module.css";
import { buildColaOperativa, buildProcesoPipeline } from "./delegacion-inicio.utils";

type DelegacionInicioViewProps = {
  session: AuthUser;
  dashboard: DashboardResponse;
  liberacionesPendientes: LiberacionPendienteCartaResponse[];
  notificacionesRecientes: NotificacionCorreoResponse[];
};

const PROCESO_COLORS: Record<string, string> = {
  activos: "var(--proceso-activo)",
  listos: "var(--proceso-listo)",
  liberados: "var(--proceso-liberado)",
  cerrados: "var(--proceso-cerrado)",
};

const PROCESO_ICONS = {
  activos: Activity,
  listos: Timer,
  liberados: CheckCircle2,
  cerrados: CircleOff,
} as const;

function ProcesosPipelineDonut({ dashboard }: { dashboard: DashboardResponse }) {
  const pipeline = buildProcesoPipeline(dashboard);
  const segments = pipeline.map((segment) => {
    const Icon = PROCESO_ICONS[segment.id as keyof typeof PROCESO_ICONS] ?? Activity;

    return {
      id: segment.id,
      label: segment.label,
      count: segment.count,
      color: PROCESO_COLORS[segment.id] ?? "var(--color-gris-400)",
      icon: Icon,
      iconTone:
        segment.id === "liberados"
          ? ("vigente" as const)
          : segment.id === "cerrados"
            ? ("sin" as const)
            : ("vencido" as const),
      countLabel: `${segment.count} ${segment.count === 1 ? "proceso" : "procesos"}`,
    };
  });

  return (
    <DashboardDonut
      segments={segments}
      centerLabel="Procesos"
      ariaLabel={segments.map((segment) => `${segment.label}: ${segment.count}`).join(". ")}
      showRings={false}
      className={dashStyles.procesoPipelineChart}
      style={{
        ["--proceso-activo" as string]: "var(--color-vino)",
        ["--proceso-listo" as string]: "var(--color-dorado-dark)",
        ["--proceso-liberado" as string]: "#3a5c47",
        ["--proceso-cerrado" as string]: "#9ca3af",
      }}
      emptyState={
        <ChartEmptyState
          title="Sin procesos registrados"
          description="Cuando haya alumnos en servicio social activo, aquí verás el avance del programa."
        />
      }
    />
  );
}

function ColaOperativaChart({ dashboard }: { dashboard: DashboardResponse }) {
  const items = buildColaOperativa(dashboard);

  return (
    <DashboardRankedBarChart
      items={items.map((item) => ({
        id: item.id,
        label: item.label,
        count: item.count,
      }))}
      emptyState={
        <ChartEmptyState
          title="Cola al día"
          description="No hay postulaciones, documentos ni liberaciones pendientes de atención en este momento."
        />
      }
    />
  );
}

export function DelegacionInicioView({
  session,
  dashboard,
  liberacionesPendientes,
  notificacionesRecientes,
}: DelegacionInicioViewProps) {
  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;

  return (
    <section
      className={`${styles.page} ${dashStyles.inicioPage}`}
      aria-labelledby="delegacion-inicio-title"
    >
      <PageHeader
        titleId="delegacion-inicio-title"
        title={<PageGreeting name={firstName} />}
        description="Panel de delegación con el resumen operativo del programa y la cola de trabajo pendiente."
      />

      <div className={dashStyles.dashboard}>
        <StatCards columns={4} compact aria-live="polite">
          <StatCard
            tone="success"
            icon={Activity}
            value={dashboard.procesosActivos}
            label="Procesos activos"
            hint={`${dashboard.liberados} liberados`}
          />
          <StatCard
            tone={dashboard.postulacionesPendientes > 0 ? "warning" : "neutral"}
            icon={ClipboardList}
            value={dashboard.postulacionesPendientes}
            label="Postulaciones pendientes"
            hint={`${dashboard.vacantesPublicadas} vacantes publicadas`}
          />
          <StatCard
            tone={dashboard.pendientesDocumentacion > 0 ? "warning" : "neutral"}
            icon={FileText}
            value={dashboard.pendientesDocumentacion}
            label="Documentos por revisar"
            hint={`${dashboard.documentacionObservada} observados`}
          />
          <StatCard
            tone="info"
            icon={Users}
            value={dashboard.totalAlumnos}
            label="Alumnos en programa"
            hint={`${dashboard.horasCompletas} con horas completas`}
          />
        </StatCards>

        <div className={dashStyles.chartsGrid}>
          <article
            className={`${dashStyles.chartCard} ${dashStyles.chartCardAnimated}`}
            aria-labelledby="delegacion-procesos-chart-title"
          >
            <header className={dashStyles.chartHeader}>
              <h2 id="delegacion-procesos-chart-title" className={dashStyles.chartTitle}>
                Avance de procesos
              </h2>
              <p className={dashStyles.chartDescription}>
                Distribución de procesos activos, listos para liberación, liberados y cerrados.
              </p>
            </header>
            <ProcesosPipelineDonut dashboard={dashboard} />
          </article>

          <article
            className={`${dashStyles.chartCard} ${dashStyles.chartCardAnimated} ${dashStyles.chartCardDelayed}`}
            aria-labelledby="delegacion-cola-chart-title"
          >
            <header className={dashStyles.chartHeader}>
              <h2 id="delegacion-cola-chart-title" className={dashStyles.chartTitle}>
                Cola operativa
              </h2>
              <p className={dashStyles.chartDescription}>
                Pendientes que requieren atención de delegación, ordenados por volumen.
              </p>
            </header>
            <ColaOperativaChart dashboard={dashboard} />
          </article>
        </div>

        {liberacionesPendientes.length > 0 ? (
          <section
            className={detailStyles.contentPanel}
            aria-labelledby="liberaciones-pendientes-title"
          >
            <div className={detailStyles.panelHeader}>
              <div className={detailStyles.panelTitleRow}>
                <h2 id="liberaciones-pendientes-title" className={detailStyles.panelTitle}>
                  Liberaciones pendientes de carta
                </h2>
                <span className={detailStyles.countBadge}>{liberacionesPendientes.length}</span>
              </div>
              <p className={detailStyles.panelDescription}>
                Procesos que requieren emisión de carta.{" "}
                <Link href={`${PANEL_PATHS.delegacion}/procesos`}>Ir a alumnos</Link>
              </p>
            </div>

            <ul className={dashStyles.depAreasList}>
              {liberacionesPendientes.slice(0, 5).map((item, index) => (
                <li key={`${item.idProceso}-${index}`} className={dashStyles.depAreasRow}>
                  <span className={dashStyles.depAreasRank} data-rank="default">
                    {index + 1}
                  </span>
                  <div className={dashStyles.depAreasBody}>
                    <div className={dashStyles.depAreasHead}>
                      <p className={dashStyles.depAreasName}>
                        {item.alumnoNombre ?? "Alumno sin nombre"}
                      </p>
                      <div className={dashStyles.depAreasMetrics}>
                        <span className={dashStyles.depAreasCount}>
                          {item.folio?.trim() || `#${item.idProceso}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {notificacionesRecientes.length > 0 ? (
          <section
            className={detailStyles.contentPanel}
            aria-labelledby="notificaciones-correo-title"
          >
            <div className={detailStyles.panelHeader}>
              <div className={detailStyles.panelTitleRow}>
                <h2 id="notificaciones-correo-title" className={detailStyles.panelTitle}>
                  Notificaciones por correo
                </h2>
                <span className={detailStyles.countBadge}>{notificacionesRecientes.length}</span>
              </div>
              <p className={detailStyles.panelDescription}>Últimos envíos registrados en el sistema.</p>
            </div>

            <ul className={dashStyles.depAreasList}>
              {notificacionesRecientes.map((notificacion, index) => (
                <li
                  key={notificacion.id ?? `${notificacion.destino ?? "correo"}-${index}`}
                  className={dashStyles.depAreasRow}
                >
                  <span className={dashStyles.depAreasRank} data-rank="default">
                    {index + 1}
                  </span>
                  <div className={dashStyles.depAreasBody}>
                    <div className={dashStyles.depAreasHead}>
                      <p className={dashStyles.depAreasName}>
                        {notificacion.asunto?.trim() || "Sin asunto"}
                      </p>
                      <EstatusBadge estatus={notificacion.estatus} />
                    </div>
                    <p className={dashStyles.depAreasShare}>
                      {notificacion.destino?.trim() || "Destino no registrado"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </section>
  );
}
