"use client";

import Link from "next/link";
import { Activity, BarChart3, FileText, GraduationCap } from "lucide-react";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AuthUser } from "@/lib/api/types";
import type { DashboardResumenResponse } from "../../types/enlace.types";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import styles from "@/shared/styles/PanelSectionView.module.css";
import inicioStyles from "@/shared/styles/PanelInicioView.module.css";

type EnlaceInicioViewProps = {
  session: AuthUser;
  resumen: DashboardResumenResponse;
};

const QUICK_ACCESS = [
  {
    href: `${PANEL_PATHS.enlace}/alumnos`,
    label: "Alumnos",
    description: "Consulta los alumnos vinculados a tu escuela.",
    icon: GraduationCap,
    statKey: "totalAlumnos" as const,
    statLabel: "registrados",
  },
  {
    href: `${PANEL_PATHS.enlace}/procesos`,
    label: "Procesos",
    description: "Revisa el avance de procesos activos.",
    icon: FileText,
    statKey: "procesosActivos" as const,
    statLabel: "activos",
  },
  {
    href: `${PANEL_PATHS.enlace}/reportes`,
    label: "Reportes",
    description: "Consulta el reporte institucional de alumnos.",
    icon: BarChart3,
    statKey: "liberados" as const,
    statLabel: "liberados",
  },
];

export function EnlaceInicioView({ session, resumen }: EnlaceInicioViewProps) {
  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;

  return (
    <section className={styles.page} aria-labelledby="enlace-inicio-title">
      <PageHeader
        titleId="enlace-inicio-title"
        title={<PageGreeting name={firstName} />}
        description="Resumen de alumnos y procesos de servicio social en tu institución."
      />

      <div className={inicioStyles.welcomeCard}>
        <p className={inicioStyles.welcomeText}>
          Tienes acceso al panel de <strong>Enlace escolar</strong>. Desde aquí puedes dar
          seguimiento a los alumnos de tu escuela y consultar el estado de sus procesos.
        </p>
      </div>

      <StatCards>
        <StatCard tone="neutral" icon={GraduationCap} value={resumen.totalAlumnos ?? 0} label="Alumnos registrados" />
        <StatCard tone="success" icon={Activity} value={resumen.procesosActivos ?? 0} label="Procesos activos" />
        <StatCard
          tone={(resumen.pendientesDocumentacion ?? 0) > 0 ? "warning" : "neutral"}
          icon={FileText}
          value={resumen.pendientesDocumentacion ?? 0}
          label="Documentación pendiente"
        />
      </StatCards>

      <div className={inicioStyles.sectionHeader}>
        <h2 className={inicioStyles.sectionTitle}>Accesos rápidos</h2>
      </div>

      <div className={inicioStyles.cardGrid}>
        {QUICK_ACCESS.map((item) => {
          const Icon = item.icon;
          const value = resumen[item.statKey] ?? 0;

          return (
            <Link key={item.href} href={item.href} className={inicioStyles.accessCard}>
              <span className={inicioStyles.accessIcon} aria-hidden="true">
                <Icon size={22} strokeWidth={2} />
              </span>
              <div className={inicioStyles.accessContent}>
                <h3 className={inicioStyles.accessTitle}>{item.label}</h3>
                <p className={inicioStyles.accessDescription}>{item.description}</p>
              </div>
              <div className={inicioStyles.accessStats}>
                <span className={inicioStyles.accessTotal}>{value}</span>
                <span className={inicioStyles.accessMeta}>{item.statLabel}</span>
              </div>
              <span className={inicioStyles.accessCta}>Entrar</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
