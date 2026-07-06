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
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import adminStyles from "@/features/admin/components/shared/AdminDetailContent.module.css";
import styles from "@/shared/styles/PanelSectionView.module.css";
import dashStyles from "@/shared/styles/PanelDashboard.module.css";
import { buildColaOperativa, buildProcesoPipeline } from "./delegacion-inicio.utils";

type DelegacionInicioViewProps = {
  session: AuthUser;
  dashboard: DashboardResponse;
  liberacionesPendientes: LiberacionPendienteCartaResponse[];
  notificacionesRecientes: NotificacionCorreoResponse[];
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

function buildDonutArcs(values: { value: number; color: string }[]) {
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

function ProcesosPipelineDonut({ dashboard }: { dashboard: DashboardResponse }) {
  const segments = buildProcesoPipeline(dashboard);
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);

  if (total === 0) {
    return (
      <div className={dashStyles.emptyChartState}>
        <p className={dashStyles.emptyChartTitle}>Sin procesos registrados</p>
        <p className={dashStyles.emptyChartHint}>
          Cuando haya alumnos en servicio social activo, aquí verás el avance del programa.
        </p>
      </div>
    );
  }

  const arcs = buildDonutArcs(
    segments.map((segment) => ({
      value: segment.count,
      color: PROCESO_COLORS[segment.id] ?? "var(--color-gris-400)",
    })),
  );

  return (
    <div
      className={`${dashStyles.convenioChart} ${dashStyles.procesoPipelineChart}`}
      style={{
        ["--proceso-activo" as string]: "var(--color-vino)",
        ["--proceso-listo" as string]: "var(--color-dorado-dark)",
        ["--proceso-liberado" as string]: "#3a5c47",
        ["--proceso-cerrado" as string]: "#9ca3af",
      }}
    >
      <div
        className={dashStyles.convenioVisual}
        role="img"
        aria-label={segments.map((segment) => `${segment.label}: ${segment.count}`).join(". ")}
      >
        <div className={dashStyles.convenioStage}>
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

      <div
        className={`${dashStyles.convenioMetrics} ${
          segments.length > 3 ? dashStyles.convenioMetricsFour : ""
        }`}
      >
        {segments.map((segment, index) => {
          const Icon = PROCESO_ICONS[segment.id as keyof typeof PROCESO_ICONS] ?? Activity;

          return (
            <div
              key={segment.id}
              className={dashStyles.convenioMetric}
              data-tone={segment.id === "liberados" ? "vigente" : segment.id === "cerrados" ? "sin" : "vencido"}
              style={{ ["--metric-index" as string]: index }}
            >
              <div className={dashStyles.convenioMetricHead}>
                <span className={`${dashStyles.convenioIcon} ${dashStyles.convenioIconVigente}`}>
                  <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className={dashStyles.convenioMetricLabel}>{segment.label}</span>
              </div>
              <span className={dashStyles.convenioMetricValue}>
                {percent(segment.count, total)}%
              </span>
              <span className={dashStyles.convenioMetricCount}>
                {segment.count} {segment.count === 1 ? "proceso" : "procesos"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ColaOperativaChart({ dashboard }: { dashboard: DashboardResponse }) {
  const items = buildColaOperativa(dashboard);

  if (items.length === 0) {
    return (
      <div className={dashStyles.emptyChartState}>
        <p className={dashStyles.emptyChartTitle}>Cola al día</p>
        <p className={dashStyles.emptyChartHint}>
          No hay postulaciones, documentos ni liberaciones pendientes de atención en este momento.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...items.map((item) => item.count));

  return (
    <div className={dashStyles.depAreasChart}>
      <div className={dashStyles.depAreasList}>
        {items.map((item, index) => {
          const width = percent(item.count, maxCount);

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
                  <p className={dashStyles.depAreasName}>{item.label}</p>
                  <div className={dashStyles.depAreasMetrics}>
                    <span className={dashStyles.depAreasCount}>{item.count}</span>
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
            className={adminStyles.contentPanel}
            aria-labelledby="liberaciones-pendientes-title"
          >
            <div className={adminStyles.panelHeader}>
              <div className={adminStyles.panelTitleRow}>
                <h2 id="liberaciones-pendientes-title" className={adminStyles.panelTitle}>
                  Liberaciones pendientes de carta
                </h2>
                <span className={adminStyles.countBadge}>{liberacionesPendientes.length}</span>
              </div>
              <p className={adminStyles.panelDescription}>
                Procesos que requieren emisión de carta.{" "}
                <Link href={`${PANEL_PATHS.delegacion}/procesos`}>Ir a procesos</Link>
              </p>
            </div>

            <ul className={dashStyles.depAreasList}>
              {liberacionesPendientes.slice(0, 5).map((item, index) => (
                <li key={item.idProceso} className={dashStyles.depAreasRow}>
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
            className={adminStyles.contentPanel}
            aria-labelledby="notificaciones-correo-title"
          >
            <div className={adminStyles.panelHeader}>
              <div className={adminStyles.panelTitleRow}>
                <h2 id="notificaciones-correo-title" className={adminStyles.panelTitle}>
                  Notificaciones por correo
                </h2>
                <span className={adminStyles.countBadge}>{notificacionesRecientes.length}</span>
              </div>
              <p className={adminStyles.panelDescription}>Últimos envíos registrados en el sistema.</p>
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
